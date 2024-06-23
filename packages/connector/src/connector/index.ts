import { ccc } from "@ckb-ccc/ccc";
import { LitElement, PropertyValues, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Ref, createRef, ref } from "lit/directives/ref.js";
import { CLOSE_SVG } from "../assets/close.svg";
import { JOY_ID_SVG } from "../assets/joy-id.svg";
import { LEFT_SVG } from "../assets/left.svg";
import { OKX_SVG } from "../assets/okx.svg";
import { UNI_SAT_SVG } from "../assets/uni-sat.svg";
import { WillUpdateEvent } from "../events";
import {
  generateConnectingScene,
  generateSignersScene,
  generateWalletsScene,
} from "../scenes";
import { WalletWithSigners } from "../types";

enum Scene {
  SelectingWallets = "SelectingWallets",
  SelectingSigners = "SelectingSigners",
  Connecting = "Connecting",
  Connected = "Connected",
}

@customElement("ccc-connector")
export class WebComponentConnector extends LitElement {
  @state()
  private wallets: WalletWithSigners[] = [];

  private resetListeners: (() => void)[] = [];

  @state()
  public isOpen: boolean = false;
  public setIsOpen(isOpen: boolean) {
    this.isOpen = isOpen;
  }

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
  private prepareSigner() {
    (async () => {
      if (this.signer && (await this.signer.signer.isConnected())) {
        this.scene = Scene.Connected;
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
    if (changedProperties.has("client")) {
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

    ccc.JoyId.getJoyIdSigners(this.client).forEach(({ signer, type, name }) => {
      this.addSigner("JoyID", name, JOY_ID_SVG, type, signer);
    });

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
  }

  private addSigner(
    walletName: string,
    signerName: string,
    icon: string,
    type: ccc.SignerType,
    signer: ccc.Signer,
  ) {
    let updated = false;
    const wallets = this.wallets.map((wallet) => {
      if (wallet.name !== walletName) {
        return wallet;
      }

      updated = true;
      return {
        ...wallet,
        signers: [...wallet.signers, { type, name: signerName, signer }],
      };
    });

    if (!updated) {
      wallets.push({
        name: walletName,
        icon,
        signers: [{ type, name: signerName, signer }],
      });
    }

    this.wallets = wallets;
  }

  mainRef: Ref<HTMLDivElement> = createRef();
  headerRef: Ref<HTMLDivElement> = createRef();
  bodyRef: Ref<HTMLDivElement> = createRef();

  render() {
    const [title, body] = (() => {
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
    );

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
                  this.scene = Scene.SelectingSigners;
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

    .text-bold {
      font-weight: bold;
    }

    .text-tip {
      color: var(--tip-color);
    }

    .fs-big {
      font-size: 1.2rem;
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
  `;
}
