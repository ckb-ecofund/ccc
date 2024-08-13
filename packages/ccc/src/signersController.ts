import { ccc } from "@ckb-ccc/core";
import { Eip6963 } from "@ckb-ccc/eip6963";
import { Rei } from "@ckb-ccc/rei";
import { JoyId } from "@ckb-ccc/joy-id";
import { Nip07 } from "@ckb-ccc/nip07";
import { Okx } from "@ckb-ccc/okx";
import { UniSat } from "@ckb-ccc/uni-sat";
import { UtxoGlobal } from "@ckb-ccc/utxo-global";
import { ETH_SVG } from "./assets/eth.svg.js";
import { JOY_ID_SVG } from "./assets/joy-id.svg.js";
import { REI_SVG } from "./assets/rei.svg.js";
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

  constructor() {}

  getConfig(configs?: {
    preferredNetworks?: ccc.NetworkPreference[];
    name?: string;
    icon?: string;
  }) {
    const name =
      configs?.name ??
      (document.querySelector("head title") as HTMLTitleElement | null)?.text ??
      "Unknown";
    const icon =
      configs?.icon ??
      (document.querySelector('link[rel="icon"]') as HTMLLinkElement | null)
        ?.href ??
      "https://fav.farm/%E2%9D%93";

    const preferredNetworks = [
      ...(configs?.preferredNetworks ?? []),
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
      name,
      icon,
      preferredNetworks,
    };
  }

  disconnect() {
    this.resetListeners.forEach((listener) => listener());
    this.resetListeners = [];
  }

  async refresh(
    client: ccc.Client,
    onUpdate: (wallets: WalletWithSigners[]) => void,
    configs?: {
      signerFilter?: (
        signerInfo: ccc.SignerInfo,
        wallet: ccc.Wallet,
      ) => Promise<boolean>;
      preferredNetworks?: ccc.NetworkPreference[];
      name?: string;
      icon?: string;
    },
  ) {
    this.disconnect();

    const wallets: WalletWithSigners[] = [];

    const { name, icon, preferredNetworks } = this.getConfig(configs);

    await this.addSigners(
      wallets,
      "UTXO Global Wallet",
      UTXO_GLOBAL_SVG,
      UtxoGlobal.getUtxoGlobalSigners(client),
      onUpdate,
      configs,
    );


    await this.addSigners(
        wallets,
        "Rei Wallet",
        REI_SVG,
        Rei.getReiSigners(client),
        onUpdate,
        configs,
    );

    await this.addSigners(
      wallets,
      "JoyID Passkey",
      JOY_ID_SVG,
      JoyId.getJoyIdSigners(client, name, icon, preferredNetworks),
      onUpdate,
      configs,
    );

    await this.addSigners(
      wallets,
      "UniSat",
      UNI_SAT_SVG,
      UniSat.getUniSatSigners(client, preferredNetworks),
      onUpdate,
      configs,
    );

    await this.addSigners(
      wallets,
      "OKX Wallet",
      OKX_SVG,
      Okx.getOKXSigners(client, preferredNetworks),
      onUpdate,
      configs,
    );

    await this.addSigner(
      wallets,
      "Nostr",
      NOSTR_SVG,
      "Nostr",
      Nip07.getNip07Signer(client),
      onUpdate,
      configs,
    );

    this.resetListeners.push(
      new Eip6963.SignerFactory(client).subscribeSigners((signer, detail) =>
        this.addSigner(
          wallets,
          detail?.info.name ?? "EVM",
          detail?.info.icon ?? ETH_SVG,
          "EVM",
          signer,
          onUpdate,
          configs,
        ),
      ),
    );

    // === Dummy signers ===

    await this.addLinkSigners(
        wallets,
        "Rei Wallet",
        REI_SVG,
        client,
        [ccc.SignerType.CKB],
        "https://reiwallet.io/",
        onUpdate,
        configs,
    );


    await this.addLinkSigners(
      wallets,
      "MetaMask",
      METAMASK_SVG,
      client,
      [ccc.SignerType.EVM],
      `https://metamask.app.link/dapp/${window.location.href}`,
      onUpdate,
      configs,
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
      onUpdate,
      configs,
    );
    await this.addLinkSigners(
      wallets,
      "UniSat",
      UNI_SAT_SVG,
      client,
      [ccc.SignerType.BTC],
      "https://unisat.io/download",
      onUpdate,
      configs,
    );
    await this.addLinkSigners(
      wallets,
      "UTXO Global Wallet",
      UTXO_GLOBAL_SVG,
      client,
      [ccc.SignerType.CKB, ccc.SignerType.BTC],
      "https://chromewebstore.google.com/detail/lnamkkidoonpeknminiadpgjiofpdmle",
      onUpdate,
      configs,
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
    onUpdate: (wallets: WalletWithSigners[]) => void,
    configs?: {
      signerFilter?: (
        signerInfo: ccc.SignerInfo,
        wallet: ccc.Wallet,
      ) => Promise<boolean>;
    },
  ) {
    return this.addSigners(
      wallets,
      walletName,
      icon,
      signerTypes.map((type) => ({
        name: type,
        signer: new ccc.SignerOpenLink(client, type, link),
      })),
      onUpdate,
      configs,
    );
  }

  private async addSigners(
    wallets: WalletWithSigners[],
    walletName: string,
    icon: string,
    signers: ccc.SignerInfo[],
    onUpdate: (wallets: WalletWithSigners[]) => void,
    configs?: {
      signerFilter?: (
        signerInfo: ccc.SignerInfo,
        wallet: ccc.Wallet,
      ) => Promise<boolean>;
    },
  ) {
    return Promise.all(
      signers.map(({ signer, name }) =>
        this.addSigner(
          wallets,
          walletName,
          icon,
          name,
          signer,
          onUpdate,
          configs,
        ),
      ),
    );
  }

  private async addSigner(
    wallets: WalletWithSigners[],
    walletName: string,
    icon: string,
    signerName: string,
    signer: ccc.Signer | null | undefined,
    onUpdate: (wallets: WalletWithSigners[]) => void,
    configs?: {
      signerFilter?: (
        signerInfo: ccc.SignerInfo,
        wallet: ccc.Wallet,
      ) => Promise<boolean>;
    },
  ): Promise<void> {
    if (!signer) {
      return;
    }

    const signerInfo = { name: signerName, signer };
    const signerFilter = configs?.signerFilter;

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

    onUpdate(wallets);
  }
}
