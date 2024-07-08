import { ccc } from "@ckb-ccc/ccc";
import { LitElement, PropertyValues, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Ref, createRef, ref } from "lit/directives/ref.js";
import { NOSTR_SVG } from "../assets/chains/nostr.svg";
import { CLOSE_SVG } from "../assets/close.svg";
import { JOY_ID_SVG } from "../assets/joy-id.svg";
import { LEFT_SVG } from "../assets/left.svg";
import { METAMASK_SVG } from "../assets/metamask.svg";
import { OKX_SVG } from "../assets/okx.svg";
import { UNI_SAT_SVG } from "../assets/uni-sat.svg";
import { ClosedEvent, WillUpdateEvent } from "../events";
import {
  generateConnectingScene,
  generateSignersScene,
  generateWalletsScene,
} from "../scenes";
import { generateConnectedScene } from "../scenes/connected";
import { generateNetworksScene } from "../scenes/networks";
import { WalletWithSigners } from "../types";

enum Scene {
  SelectingWallets = "SelectingWallets",
  SelectingSigners = "SelectingSigners",
  Connecting = "Connecting",
  Connected = "Connected",
  SwitchingNetworks = "SwitchingNetworks",
}

@customElement("ccc-connector")
export class WebComponentConnector extends LitElement {
  @state()
  private wallets: WalletWithSigners[] = [];
  @property()
  public signerFilter?: (
    signerInfo: ccc.SignerInfo,
    wallet: ccc.Wallet,
  ) => Promise<boolean>;

  private resetListeners: (() => void)[] = [];

  @property()
  public name?: string;
  @property()
  public icon?: string;

  @property()
  public client: ccc.Client = new ccc.ClientPublicTestnet();
  public setClient(client: ccc.Client) {
    this.client = client;
  }

  @state()
  private scene: Scene = Scene.SelectingWallets;
  @state()
  private selectedWallet?: WalletWithSigners;
  @state()
  private selectedSigner?: ccc.SignerInfo;
  @state()
  private connectingError?: string;

  @state()
  private walletName?: string;
  @state()
  private signerName?: string;
  @state()
  public wallet?: ccc.Wallet;
  @state()
  public signer?: ccc.SignerInfo;

  @state()
  private recommendAddress?: string;
  @state()
  private internalAddress?: string;
  @state()
  private balance?: ccc.Num;

  private async updateSignerInfo() {
    const signer = this.signer?.signer;
    if (!signer) {
      return;
    }
    this.recommendAddress = await signer.getRecommendedAddress();
    this.internalAddress = await signer.getInternalAddress();
    this.balance = await signer.getBalance();
  }

  private async prepareSigner() {
    if (this.signer && (await this.signer.signer.isConnected())) {
      await this.updateSignerInfo();
      this.scene = Scene.Connected;
      return;
    }

    this.wallet = undefined;
    this.signer = undefined;
    this.scene = Scene.SelectingWallets;
  }

  public disconnect() {
    this.signer?.signer?.disconnect();
    this.walletName = undefined;
    this.signerName = undefined;
    this.saveConnection();
    this.closedHandler();
  }

  private loadConnection() {
    const {
      signerName,
      walletName,
    }: { signerName?: string; walletName?: string } = JSON.parse(
      window.localStorage.getItem("ccc-connection-info") ?? "{}",
    );

    this.signerName = signerName;
    this.walletName = walletName;
  }

  private saveConnection() {
    window.localStorage.setItem(
      "ccc-connection-info",
      JSON.stringify({
        signerName: this.signerName,
        walletName: this.walletName,
      }),
    );
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.loadConnection();
    this.reloadSigners();
  }

  willUpdate(changedProperties: PropertyValues): void {
    if (
      changedProperties.has("client") ||
      changedProperties.has("signerFilter")
    ) {
      this.reloadSigners();
    }
    if (
      (changedProperties.has("scene") && this.scene === Scene.Connected) ||
      changedProperties.has("wallets") ||
      changedProperties.has("walletName") ||
      changedProperties.has("signerName")
    ) {
      (async () => {
        const wallet = this.wallets.find(
          ({ name }) => name === this.walletName,
        );
        const signer = wallet?.signers.find(
          ({ name }) => name === this.signerName,
        );
        if (signer && (await signer.signer.isConnected())) {
          this.wallet = wallet;
          this.signer = signer;
        } else {
          this.wallet = undefined;
          this.signer = undefined;
        }
      })();
    }
    if (changedProperties.has("signer")) {
      this.prepareSigner();
    }

    this.dispatchEvent(new WillUpdateEvent());
  }

  private reloadSigners() {
    this.wallets = [];

    (async () => {
      const signer = this.signer;
      if (!signer) {
        return;
      }

      if (await signer.signer.replaceClient(this.client)) {
        this.signer = {
          ...signer,
        };
      } else {
        this.signer = undefined;
      }
    })();

    this.resetListeners.forEach((listener) => listener());
    this.resetListeners = [];
    const name =
      this.name ??
      (document.querySelector("head title") as HTMLTitleElement).text;
    const icon =
      this.icon ??
      (document.querySelector('link[rel="icon"]') as HTMLLinkElement).href;

    ccc.JoyId.getJoyIdSigners(this.client, name, icon).forEach(
      ({ signer, name }) => {
        this.addSigner("JoyID", name, JOY_ID_SVG, signer);
      },
    );

    const uniSatSigner = ccc.UniSat.getUniSatSigner(this.client);
    if (uniSatSigner) {
      this.addSigner("UniSat", "BTC", UNI_SAT_SVG, uniSatSigner);
    }

    const okxBitcoinSigner = ccc.Okx.getOKXBitcoinSigner(this.client);
    if (okxBitcoinSigner) {
      this.addSigner("OKX Wallet", "BTC", OKX_SVG, okxBitcoinSigner);
    }

    const nip07Signer = ccc.Nip07.getNip07Signer(this.client);
    if (nip07Signer) {
      this.addSigner("Nostr", "Nostr", NOSTR_SVG, nip07Signer);
    }

    const eip6963Manager = new ccc.Eip6963.SignerFactory(this.client);
    this.resetListeners.push(
      eip6963Manager.subscribeSigners((signer) => {
        this.addSigner(
          `${signer.detail.info.name}`,
          "EVM",
          signer.detail.info.icon,
          signer,
        );
      }),
    );

    // === Dummy signers ===
    this.addSigner(
      "MetaMask",
      "EVM",
      METAMASK_SVG,
      new ccc.SignerOpenLink(
        this.client,
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
          this.client,
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
        this.client,
        ccc.SignerType.BTC,
        "https://unisat.io/download",
      ),
    );
    // ===
  }

  private async addSigner(
    walletName: string,
    signerName: string,
    icon: string,
    signer: ccc.Signer,
  ) {
    const signerInfo = { name: signerName, signer };
    if (
      this.signerFilter &&
      !(await this.signerFilter(signerInfo, { name: walletName, icon }))
    ) {
      return;
    }
    let updated = false;
    const wallets = this.wallets.map((wallet) => {
      if (wallet.name !== walletName) {
        return wallet;
      }

      updated = true;
      const allSigners = [...wallet.signers, signerInfo];
      const signers = allSigners.filter(
        ({ signer }) => !(signer instanceof ccc.SignerDummy),
      );
      return {
        ...wallet,
        signers: signers.length !== 0 ? signers : [signerInfo],
      };
    });

    if (!updated) {
      wallets.push({
        name: walletName,
        icon,
        signers: [signerInfo],
      });
    }

    this.wallets = wallets;
  }

  mainRef: Ref<HTMLDivElement> = createRef();
  headerRef: Ref<HTMLDivElement> = createRef();
  bodyRef: Ref<HTMLDivElement> = createRef();

  render() {
    const [title, body] = (() => {
      if (this.scene === Scene.Connected && this.wallet && this.signer) {
        return generateConnectedScene(
          this.wallet,
          this.signer,
          this.recommendAddress,
          this.internalAddress,
          this.balance,
          this.disconnect.bind(this),
          () => {
            this.scene = Scene.SwitchingNetworks;
          },
        );
      }
      if (this.scene === Scene.SwitchingNetworks) {
        return generateNetworksScene(this.client, (client) => {
          this.setClient(client);
          this.closedHandler();
        });
      }
      if (this.scene === Scene.SelectingWallets || !this.selectedWallet) {
        return generateWalletsScene(
          this.wallets,
          (wallet) => {
            this.selectedWallet = wallet;
            this.scene = Scene.SelectingSigners;
          },
          this.signerSelectedHandler,
        );
      }
      if (this.scene === Scene.SelectingSigners || !this.selectedSigner) {
        return generateSignersScene(
          this.selectedWallet,
          this.signerSelectedHandler,
        );
      }
      return generateConnectingScene(
        this.selectedWallet,
        this.selectedSigner,
        this.connectingError,
        this.signerSelectedHandler,
      );
    })();

    const canBack = [
      Scene.SelectingSigners,
      Scene.Connecting,
      Scene.SwitchingNetworks,
    ].includes(this.scene);

    return html` <div
      class="background"
      @click=${(event: Event) => {
        if (event.target === event.currentTarget) {
          this.closedHandler();
        }
      }}
    >
      <div class="main" ${ref(this.mainRef)}>
        <div
          class="header text-bold fs-lg ${title == null
            ? ""
            : "header-divider"}"
          ${ref(this.headerRef)}
        >
          <img
            class="back ${canBack ? "active" : ""}"
            src=${LEFT_SVG}
            @click=${() => {
              if (this.scene === Scene.Connecting) {
                if ((this.selectedWallet?.signers.length ?? 0) <= 1) {
                  this.scene = Scene.SelectingWallets;
                } else {
                  this.scene = Scene.SelectingSigners;
                }
              } else if (this.scene === Scene.SelectingSigners) {
                this.scene = Scene.SelectingWallets;
              } else if (this.scene === Scene.SwitchingNetworks) {
                this.scene = Scene.Connected;
              }
            }}
          />
          ${title}
          <img
            class="close active"
            src=${CLOSE_SVG}
            @click=${this.closedHandler}
          />
        </div>
        <div class="body" ${ref(this.bodyRef)}>${body}</div>
      </div>
    </div>`;
  }

  updated() {
    if (!this.mainRef.value) {
      return;
    }
    this.mainRef.value.style.height = `${
      (this.bodyRef.value?.clientHeight ?? 0) +
      (this.headerRef.value?.clientHeight ?? 0)
    }px`;
  }

  private closedHandler = () => {
    if (
      [
        Scene.SelectingSigners,
        Scene.SelectingWallets,
        Scene.Connecting,
      ].includes(this.scene)
    ) {
      this.scene = Scene.SelectingWallets;
      this.selectedSigner = undefined;
      this.selectedWallet = undefined;
    } else if ([Scene.SwitchingNetworks].includes(this.scene)) {
      this.scene = Scene.Connected;
    }

    this.dispatchEvent(new ClosedEvent());
  };

  private signerSelectedHandler = (
    wallet: WalletWithSigners,
    signerInfo: ccc.SignerInfo,
  ) => {
    this.scene = Scene.Connecting;
    this.connectingError = undefined;
    this.selectedWallet = wallet;
    this.selectedSigner = signerInfo;
    (async () => {
      const { signer } = signerInfo;
      try {
        await signer.connect();
      } catch (error) {
        if (typeof error === "object") {
          const message = (error as { message: unknown })?.message;
          if (typeof message === "string") {
            this.connectingError = message;
          } else {
            this.connectingError = JSON.stringify(message);
          }
          return;
        }

        this.connectingError = JSON.stringify(error);
      }
      if (!(await signer.isConnected())) {
        return;
      }
      this.scene = Scene.Connected;
      this.walletName = wallet.name;
      this.signerName = signerInfo.name;
      this.saveConnection();
      this.closedHandler();
      this.internalAddress = await signer.getInternalAddress();
      this.recommendAddress = await signer.getRecommendedAddress();
      this.balance = await signer.getBalance();
    })();
  };

  static styles = css`
    :host {
      width: 100vw;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
    }

    button {
      background: none;
      color: inherit;
      border: none;
      padding: 0;
      font: inherit;
      cursor: pointer;
      outline: inherit;
    }

    .text-bold {
      font-weight: bold;
    }

    .text-tip {
      color: var(--tip-color);
    }

    .fs-sm {
      font-size: 0.8rem;
    }
    .fs-md {
      font-size: 1rem;
    }
    .fs-lg {
      font-size: 1.2rem;
    }
    .fs-xl {
      font-size: 1.5rem;
    }

    .mb-1 {
      margin-bottom: 0.7rem;
    }
    .mb-2 {
      margin-bottom: 1rem;
    }
    .mt-1 {
      margin-top: 0.7rem;
    }
    .mt-2 {
      margin-top: 1rem;
    }
    .ml-1 {
      margin-left: 0.7rem;
    }
    .ml-2 {
      margin-left: 1em;
    }
    .mr-1 {
      margin-right: 0.7rem;
    }
    .mr-2 {
      margin-right: 1rem;
    }

    .background {
      width: 100%;
      height: 100%;
      background: rgba(18, 19, 24, 0.7);
    }

    .main {
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background: var(--background);
      border-radius: 1.2rem;
      overflow: hidden;
      transition: height 0.15s ease-out;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.3rem 0.5rem;
    }

    .header-divider {
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--divider);
      margin-bottom: 1rem;
    }

    .close,
    .back {
      width: 0.8rem;
      height: 0.8rem;
      opacity: 0;
      transition: opacity 0.15s ease-in-out;
    }

    .close.active,
    .back.active {
      opacity: 1;
      cursor: pointer;
    }

    .body {
      padding: 0 1.3rem 1.4rem;
      min-width: 20rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .btn-primary {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: start;
      padding: 0.75rem 1rem;
      background: var(--btn-primary);
      border-radius: 0.4rem;
      transition: background 0.15s ease-in-out;
    }
    .btn-primary img {
      width: 2rem;
      height: 2rem;
      margin-right: 1rem;
      border-radius: 0.4rem;
    }
    .btn-primary:hover {
      background: var(--btn-primary-hover);
    }
    .btn-primary:disabled {
      cursor: not-allowed;
    }
    .btn-primary:disabled:hover {
      background: var(--btn-primary);
    }

    .btn-secondary {
      display: flex;
      align-items: center;
      padding: 0.25rem 1rem;
      background: var(--btn-secondary);
      border-radius: 9999px;
      transition: background 0.15s ease-in-out;
    }
    .btn-secondary img {
      width: 0.8rem;
      height: 0.8rem;
      margin-right: 0.5rem;
    }
    .btn-secondary:hover {
      background: var(--btn-secondary-hover);
    }
    .btn-secondary:disabled {
      cursor: not-allowed;
    }
    .btn-secondary:disabled:hover {
      background: var(--btn-secondary);
    }

    .wallet-icon {
      width: 4rem;
      height: 4rem;
      margin-bottom: 0.5rem;
      border-radius: 0.8rem;
    }

    .connecting-wallet-icon {
      width: 5rem;
      height: 5rem;
      border-radius: 1rem;
    }

    .position-relative {
      position: relative;
    }
    .position-absolute {
      position: absolute;
    }

    .connected-type-icon {
      position: absolute;
      width: 1.5rem;
      height: 1.5rem;
      right: -0.5rem;
      bottom: -0.5rem;
    }

    .text-center {
      text-align: center;
    }

    .cursor-pointer {
      cursor: pointer;
    }

    .flex {
      display: flex;
    }
    .justify-center {
      justify-content: center;
    }
    .justify-between {
      justify-content: space-between;
    }
    .align-center {
      align-items: center;
    }

    .switch-btn-container {
      width: 100%;
      padding: 1rem;
    }

    .switch-line {
      flex: 1;
      height: 1px;
      background-color: var(--divider);
    }

    .switching-status-dot {
      width: 0.5rem;
      height: 0.5rem;
      background: #0f0;
      border-radius: 50%;
    }

    .copy-btn {
      width: 1.5rem;
      height: 1.5rem;
    }

    .copy-btn-sm {
      width: 1rem;
      height: 1rem;
    }

    .sm-chain-logo {
      width: 1.125rem;
    }
  `;
}
