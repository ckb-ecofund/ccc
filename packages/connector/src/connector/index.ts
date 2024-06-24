import { ccc } from "@ckb-ccc/ccc";
import { LitElement, PropertyValues, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Ref, createRef, ref } from "lit/directives/ref.js";
import { CLOSE_SVG } from "../assets/close.svg";
import { JOY_ID_SVG } from "../assets/joy-id.svg";
import { LEFT_SVG } from "../assets/left.svg";
import { METAMASK_SVG } from "../assets/metamask.svg";
import { OKX_SVG } from "../assets/okx.svg";
import { UNI_SAT_SVG } from "../assets/uni-sat.svg";
import { WillUpdateEvent } from "../events";
import {
  generateConnectingScene,
  generateSignersScene,
  generateWalletsScene,
} from "../scenes";
import { SignerOpenLink } from "../signerOpenLink";
import { WalletWithSigners } from "../types";
import { generateConnectedScene } from "../scenes/connected";
import { generateSwitchingScene } from "../scenes/switching";

enum Scene {
  SelectingWallets = "SelectingWallets",
  SelectingSigners = "SelectingSigners",
  Connecting = "Connecting",
  Connected = "Connected",
  Switching = "Switching"
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

  @state()
  public isOpen: boolean = false;
  public setIsOpen(isOpen: boolean) {
    this.isOpen = isOpen;
  }

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
  private walletName?: string;
  @state()
  private signerName?: string;
  @state()
  public wallet?: ccc.Wallet;
  @state()
  public signer?: ccc.SignerInfo;

  @state()
  public recommendAddress?: string;
  @state()
  public internalAddress?: string;
  @state()
  private balance?: string;

  private async updateSignerInfo() {
    if (this.signer) {
      this.recommendAddress = await this.signer.signer.getRecommendedAddress();
      this.balance = ccc.fixedPointToString((await this.signer.signer.getBalance()));
      this.internalAddress = await this.signer.signer.getInternalAddress();
      this.requestUpdate(); 
    }
  }


  private prepareSigner() {
    (async () => {
      if (this.signer && (await this.signer.signer.isConnected())) {
        this.scene = Scene.Connected;
        await this.updateSignerInfo();
        return;
      }

      this.wallet = undefined;
      this.signer = undefined;
      this.scene = Scene.SelectingWallets;
    })();
  }

  public disconnect() {
    this.signer?.signer?.disconnect();
    this.walletName = undefined;
    this.signerName = undefined;
    this.saveConnection();
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
      changedProperties.has("walletName") ||
      changedProperties.has("wallets")
    ) {
      this.wallet = this.wallets.find(({ name }) => name === this.walletName);
    }
    if (
      changedProperties.has("signerName") ||
      changedProperties.has("wallet")
    ) {
      const wallet = this.wallets.find(({ name }) => name === this.walletName);
      this.signer = wallet?.signers.find(
        ({ name }) => name === this.signerName,
      );
    }
    if (changedProperties.has("signer")) {
      this.prepareSigner();
    }

    this.dispatchEvent(new WillUpdateEvent());
  }

  private reloadSigners() {
    this.wallets = [];

    (async () => {
      if (!this.signer) {
        return;
      }

      this.signer = {
        ...this.signer,
        signer: await this.signer.signer.replaceClient(this.client),
      };
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
      ({ signer, type, name }) => {
        this.addSigner("JoyID", name, JOY_ID_SVG, type, signer);
      },
    );

    const uniSatSigner = ccc.UniSat.getUniSatSigner(this.client);
    if (uniSatSigner) {
      this.addSigner(
        "UniSat",
        "BTC",
        UNI_SAT_SVG,
        ccc.SignerType.BTC,
        uniSatSigner,
      );
    }

    const okxBitcoinSigner = ccc.Okx.getOKXBitcoinSigner(this.client);
    if (okxBitcoinSigner) {
      this.addSigner(
        "OKX Wallet",
        "BTC",
        OKX_SVG,
        ccc.SignerType.BTC,
        okxBitcoinSigner,
      );
    }

    const eip6963Manager = new ccc.Eip6963.SignerFactory(this.client);
    this.resetListeners.push(
      eip6963Manager.subscribeSigners((signer) => {
        this.addSigner(
          `${signer.detail.info.name}`,
          "EVM",
          signer.detail.info.icon,
          ccc.SignerType.EVM,
          signer,
        );
      }),
    );

    // === Dummy signers ===
    this.addSigner(
      "MetaMask",
      "BTC",
      METAMASK_SVG,
      ccc.SignerType.EVM,
      new SignerOpenLink(
        this.client,
        `https://metamask.app.link/dapp/${window.location.href}`,
      ),
    );
    [ccc.SignerType.EVM, ccc.SignerType.BTC].forEach((type) => {
      this.addSigner(
        "OKX Wallet",
        type,
        OKX_SVG,
        type,
        new SignerOpenLink(this.client, "https://www.okx.com/zh-hans/download"),
      );
    });
    this.addSigner(
      "UniSat",
      ccc.SignerType.BTC,
      UNI_SAT_SVG,
      ccc.SignerType.BTC,
      new SignerOpenLink(this.client, "https://unisat.io/"),
    );
    // ===
  }

  private async addSigner(
    walletName: string,
    signerName: string,
    icon: string,
    type: ccc.SignerType,
    signer: ccc.Signer,
  ) {
    const signerInfo = { type, name: signerName, signer };
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
        ({ signer }) => !(signer instanceof SignerOpenLink),
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
      if(this.scene === Scene.Switching && this.recommendAddress) {
        return generateSwitchingScene(
          this.recommendAddress,
          () => {}
        )
      }
      if (this.scene === Scene.Connected && this.wallet && this.signer) {
        return generateConnectedScene(
          this.wallet,
          this.signer,
          this.recommendAddress,
          this.internalAddress,
          this.balance,
          this.disconnect.bind(this),
          () => {
            this.scene = Scene.Switching;
          }
        )
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
        this.signerSelectedHandler,
      );
    })();

    const canBack = [Scene.SelectingSigners, Scene.Connecting].includes(
      this.scene,
    ) && this.scene !== Scene.Connected;

    return html`<style>
        :host {
          ${this.isOpen ? "" : "display: none;"}
          --background: #fff;
          --divider: #eee;
          --btn-primary: #f8f8f8;
          --btn-primary-hover: #efeeee;
          --btn-secondary: #ddd;
          color: #1e1e1e;
          --tip-color: #666;
        }
      </style>
      <div
        class="background"
        @click=${(event: Event) => {
          if (event.target === event.currentTarget) {
            this.closedHandler();
          }
        }}
      >
        <div class="main" ${ref(this.mainRef)}>
          <div class="header text-bold fs-big" ${ref(this.headerRef)}>
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
    } else if ([Scene.Switching].includes(this.scene)) {
      this.scene = Scene.Connected;
    }

    this.isOpen = false;
  };

  private signerSelectedHandler = (
    wallet: WalletWithSigners,
    signer: ccc.SignerInfo,
  ) => {
    this.scene = Scene.Connecting;
    this.selectedWallet = wallet;
    this.selectedSigner = signer;
    (async () => {
      await signer.signer.connect();
      if (!(await signer.signer.isConnected())) {
        return;
      }
      this.scene = Scene.Connected;
      this.walletName = wallet.name;
      this.signerName = signer.name;
      this.recommendAddress = await signer.signer.getRecommendedAddress();
      this.balance = (await signer.signer.getBalance()).toString();
      this.saveConnection();
      this.closedHandler();
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

    .block {
      display: block;
    }

    .text-bold {
      font-weight: bold;
    }

    .text-tip {
      color: var(--tip-color);
    }

    .font-black {
      color: #000
    }

    .fs-semi-big {
      font-size: 1.5rem;
    }
    .fs-big {
      font-size: 1.2rem;
    }
    .fs-mid {
      font-size: 1rem;
    }
    .fs-sm {
      font-size: 0.8rem
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
      padding: 1rem 1.3rem;
      border-bottom: 1px solid var(--divider);
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
      padding: 1.4rem 1.3rem;
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

    .connected-icon-container {
      position: relative;
    }

    .connected-type-icon {
      position: absolute;
      width: 1.5rem;
      height: 1.5rem;
      right:0;
      bottom:0;
    }

    .font-montserrat {
      font-family: Montserrat
    }

    .font-gray {
      color: #999999
    }

    .text-center {
      text-align: center
    }

    .hover {
      cursor: pointer;
    }
    
    .flex {
      display: flex;
    }
    .justify-center {
      justify-content: space-between;
    }
    .align-center {
      align-items: center;
    }

    .switch-btn-container {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: center;
      padding: 1rem; 
    }

    .switch-line {
      flex: 1;
      height: 0.0625rem;
      background-color: #ddd;
    }

    .switch-content {
      display: flex;
      align-items: center;
      margin: 0 1.25rem;
    }

    .switch-content img {
      margin-right: 0.625rem; 
    }

    .switch-content span {
      color: #333;
      margin-right: 0.625rem; 
    }

    .switch-content .arrows {
      display: flex;
      align-items: center;
    }

    .switch-content .arrows img {
      margin-left: 0.3125rem; 
    }
    
    .switching-btn-primary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: background 0.3s;
    }
    
    .switching-btn-primary img {
      width: 2rem;
      height: 2rem;
      margin-right: 1rem;
    }
    
    .switching-btn-primary span {
      flex: 1;
      text-align: left;
    }
    
    .switching-connected {
      font-size: 0.875rem;
      color: #000;
      margin-right: 1rem;
    }
    
    .switching-status-dot {
      width: 0.5rem;
      height: 0.5rem;
      background: #0f0;
      border-radius: 50%;
    }
    
    .switching-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1rem 0;
      font-size: 1.5rem;
      font-weight: bold;
      color: #fff;
    }
    
    .switching-close-button {
      cursor: pointer;
      width: 1rem;
      height: 1rem;
    }
  `;
}
