import { ccc } from "@ckb-ccc/ccc";
import { ReactiveController, ReactiveControllerHost } from "lit";
import { NOSTR_SVG } from "../assets/chains/nostr.svg";
import { JOY_ID_SVG } from "../assets/joy-id.svg";
import { METAMASK_SVG } from "../assets/metamask.svg";
import { OKX_SVG } from "../assets/okx.svg";
import { UNI_SAT_SVG } from "../assets/uni-sat.svg";
import { UTXO_GLOBAL_SVG } from "../assets/utxo-global.svg";
import { WalletWithSigners } from "../types";

export class SignersController implements ReactiveController {
  public wallets: WalletWithSigners[] = [];

  private resetListeners: (() => void)[] = [];

  constructor(
    private readonly host: ReactiveControllerHost & {
      client: ccc.Client;
      signerFilter?: (
        signerInfo: ccc.SignerInfo,
        wallet: ccc.Wallet,
      ) => Promise<boolean>;
      preferredNetworks?: ccc.NetworkPreference[];
      name?: string;
      icon?: string;
      refreshSigner: () => void;
    },
  ) {
    host.addController(this);
  }

  getConfig() {
    const name =
      this.host.name ??
      (document.querySelector("head title") as HTMLTitleElement).text;
    const icon =
      this.host.icon ??
      (document.querySelector('link[rel="icon"]') as HTMLLinkElement).href;
    const preferredNetworks = [
      ...(this.host.preferredNetworks ?? []),
      {
        addressPrefix: "ckb",
        signerType: ccc.SignerType.BTC,
        network: "btc",
      },
      {
        addressPrefix: "ckt",
        signerType: ccc.SignerType.BTC,
        network: "btcTestnet",
      },
    ];

    return {
      client: this.host.client,
      name,
      icon,
      preferredNetworks,
    };
  }

  update() {
    this.host.refreshSigner();
    this.host.requestUpdate();
  }

  refresh() {
    this.resetListeners.forEach((listener) => listener());
    this.resetListeners = [];

    this.wallets = [];

    const { client, name, icon, preferredNetworks } = this.getConfig();

    ccc.JoyId.getJoyIdSigners(client, name, icon, preferredNetworks).forEach(
      ({ signer, name }) => {
        this.addSigner("JoyID", name, JOY_ID_SVG, signer);
      },
    );

    const uniSatSigner = ccc.UniSat.getUniSatSigner(client, preferredNetworks);
    if (uniSatSigner) {
      this.addSigner("UniSat", "BTC", UNI_SAT_SVG, uniSatSigner);
    }

    ccc.Okx.getOKXBitcoinSigner(client, preferredNetworks).forEach((signer) => {
      this.addSigner("OKX Wallet", signer.type, OKX_SVG, signer);
    });

    const nip07Signer = ccc.Nip07.getNip07Signer(client);
    if (nip07Signer) {
      this.addSigner("Nostr", "Nostr", NOSTR_SVG, nip07Signer);
    }

    ccc.UtxoGlobal.getUtxoGlobalSigners(client).forEach(({ signer, name }) => {
      this.addSigner("UTXO Global Wallet", name, UTXO_GLOBAL_SVG, signer);
    });

    const eip6963Manager = new ccc.Eip6963.SignerFactory(client);
    this.resetListeners.push(
      eip6963Manager.subscribeSigners((signer) => {
        this.addSigner(
          `${signer.detail.info.name}`,
          "EVM",
          signer.detail.info.icon,
          signer,
        );
        this.update();
      }),
    );

    // === Dummy signers ===
    this.addSigner(
      "MetaMask",
      "EVM",
      METAMASK_SVG,
      new ccc.SignerOpenLink(
        client,
        ccc.SignerType.EVM,
        `https://metamask.app.link/dapp/${window.location.href}`,
      ),
    );
    [ccc.SignerType.EVM, ccc.SignerType.BTC].forEach((type) => {
      this.addSigner(
        "OKX Wallet",
        type,
        OKX_SVG,
        new ccc.SignerOpenLink(
          client,
          type,
          "https://www.okx.com/download?deeplink=" +
            encodeURIComponent(
              "okx://wallet/dapp/url?dappUrl=" +
                encodeURIComponent(window.location.href),
            ),
        ),
      );
    });
    this.addSigner(
      "UniSat",
      ccc.SignerType.BTC,
      UNI_SAT_SVG,
      new ccc.SignerOpenLink(
        client,
        ccc.SignerType.BTC,
        "https://unisat.io/download",
      ),
    );

    [ccc.SignerType.CKB, ccc.SignerType.BTC].forEach((type) => {
      this.addSigner(
        "UTXO Global Wallet",
        type,
        UTXO_GLOBAL_SVG,
        new ccc.SignerOpenLink(
          client,
          type,
          "https://chromewebstore.google.com/detail/lnamkkidoonpeknminiadpgjiofpdmle",
        ),
      );
    });

    // ===
  }

  private async addSigner(
    walletName: string,
    signerName: string,
    icon: string,
    signer: ccc.Signer,
  ) {
    const signerInfo = { name: signerName, signer };

    const signerFilter = this.host.signerFilter;
    if (
      signerFilter &&
      !(await signerFilter(signerInfo, { name: walletName, icon }))
    ) {
      return;
    }

    const wallet = this.wallets.find((w) => w.name === walletName);

    if (!wallet) {
      this.wallets.push({
        name: walletName,
        icon,
        signers: [signerInfo],
      });
    } else {
      const signers = [...wallet.signers, signerInfo].filter(
        ({ signer }) => !(signer instanceof ccc.SignerDummy),
      );
      wallet.signers = signers.length !== 0 ? signers : [signerInfo];
    }

    this.update();
  }

  hostConnected(): void {
    this.refresh();
    // Wait for plugins to be loaded
    setTimeout(() => this.refresh(), 100);
  }
  hostDisconnected(): void {}
}
