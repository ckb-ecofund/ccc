import { ccc } from "@ckb-ccc/core";
import { Eip6963 } from "@ckb-ccc/eip6963";
import { JoyId } from "@ckb-ccc/joy-id";
import { Nip07 } from "@ckb-ccc/nip07";
import { Okx } from "@ckb-ccc/okx";
import { UniSat } from "@ckb-ccc/uni-sat";
import { UtxoGlobal } from "@ckb-ccc/utxo-global";
import { JOY_ID_SVG } from "./assets/joy-id.svg.js";
import { METAMASK_SVG } from "./assets/metamask.svg.js";
import { NOSTR_SVG } from "./assets/nostr.svg.js";
import { OKX_SVG } from "./assets/okx.svg.js";
import { UNI_SAT_SVG } from "./assets/uni-sat.svg.js";
import { UTXO_GLOBAL_SVG } from "./assets/utxo-global.svg.js";

export type WalletWithSigners = ccc.Wallet & {
  signers: ccc.SignerInfo[];
};

export class SignersController {
  private resetListeners: (() => void)[] = [];

  constructor(
    public client: ccc.Client,
    public onUpdate: (wallets: WalletWithSigners[]) => void,
    public configs?: {
      signerFilter?: (
        signerInfo: ccc.SignerInfo,
        wallet: ccc.Wallet,
      ) => Promise<boolean>;
      preferredNetworks?: ccc.NetworkPreference[];
      name?: string;
      icon?: string;
    },
  ) {}

  getConfig() {
    const name =
      this.configs?.name ??
      (document.querySelector("head title") as HTMLTitleElement | null)?.text ??
      "Unknown";
    const icon =
      this.configs?.icon ??
      (document.querySelector('link[rel="icon"]') as HTMLLinkElement | null)
        ?.href ??
      "https://fav.farm/%E2%9D%93";

    const preferredNetworks = [
      ...(this.configs?.preferredNetworks ?? []),
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
      client: this.client,
      name,
      icon,
      preferredNetworks,
    };
  }

  disconnect() {
    this.resetListeners.forEach((listener) => listener());
    this.resetListeners = [];
  }

  async refresh() {
    this.disconnect();

    const wallets: WalletWithSigners[] = [];

    const { client, name, icon, preferredNetworks } = this.getConfig();

    await this.addSigners(
      wallets,
      "UTXO Global Wallet",
      UTXO_GLOBAL_SVG,
      UtxoGlobal.getUtxoGlobalSigners(client),
    );

    await this.addSigners(
      wallets,
      "JoyID Passkey",
      JOY_ID_SVG,
      JoyId.getJoyIdSigners(client, name, icon, preferredNetworks),
    );

    await this.addSigners(
      wallets,
      "UniSat",
      UNI_SAT_SVG,
      UniSat.getUniSatSigners(client, preferredNetworks),
    );

    await this.addSigners(
      wallets,
      "OKX Wallet",
      OKX_SVG,
      Okx.getOKXSigners(client, preferredNetworks),
    );

    await this.addSigner(
      wallets,
      "Nostr",
      NOSTR_SVG,
      "Nostr",
      Nip07.getNip07Signer(client),
    );

    this.resetListeners.push(
      new Eip6963.SignerFactory(client).subscribeSigners((signer) =>
        this.addSigner(
          wallets,
          `${signer.detail.info.name}`,
          signer.detail.info.icon,
          "EVM",
          signer,
        ),
      ),
    );

    // === Dummy signers ===
    await this.addLinkSigners(
      wallets,
      "MetaMask",
      METAMASK_SVG,
      client,
      [ccc.SignerType.EVM],
      `https://metamask.app.link/dapp/${window.location.href}`,
    );
    await this.addLinkSigners(
      wallets,
      "OKX Wallet",
      OKX_SVG,
      client,
      [ccc.SignerType.EVM, ccc.SignerType.BTC],
      "https://www.okx.com/download?deeplink=" +
        encodeURIComponent(
          "okx://wallet/dapp/url?dappUrl=" +
            encodeURIComponent(window.location.href),
        ),
    );
    await this.addLinkSigners(
      wallets,
      "UniSat",
      UNI_SAT_SVG,
      client,
      [ccc.SignerType.BTC],
      "https://unisat.io/download",
    );
    await this.addLinkSigners(
      wallets,
      "UTXO Global Wallet",
      UTXO_GLOBAL_SVG,
      client,
      [ccc.SignerType.CKB, ccc.SignerType.BTC],
      "https://chromewebstore.google.com/detail/lnamkkidoonpeknminiadpgjiofpdmle",
    );
    // ===
  }

  private async addLinkSigners(
    wallets: WalletWithSigners[],
    walletName: string,
    icon: string,
    client: ccc.Client,
    signerTypes: ccc.SignerType[],
    link: string,
  ) {
    return this.addSigners(
      wallets,
      walletName,
      icon,
      signerTypes.map((type) => ({
        name: type,
        signer: new ccc.SignerOpenLink(client, type, link),
      })),
    );
  }

  private async addSigners(
    wallets: WalletWithSigners[],
    walletName: string,
    icon: string,
    signers: ccc.SignerInfo[],
  ) {
    return Promise.all(
      signers.map(({ signer, name }) =>
        this.addSigner(wallets, walletName, icon, name, signer),
      ),
    );
  }

  private async addSigner(
    wallets: WalletWithSigners[],
    walletName: string,
    icon: string,
    signerName: string,
    signer: ccc.Signer | null | undefined,
  ): Promise<void> {
    if (!signer) {
      return;
    }

    const signerInfo = { name: signerName, signer };
    const signerFilter = this.configs?.signerFilter;

    if (
      signerFilter &&
      !(await signerFilter(signerInfo, { name: walletName, icon }))
    ) {
      return;
    }

    const wallet = wallets.find((w) => w.name === walletName);

    if (!wallet) {
      wallets.push({
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

    this.onUpdate(wallets);
  }
}
