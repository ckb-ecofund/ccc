import { ccc } from "@ckb-ccc/ccc";
import { LitElement, PropertyValues, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { CLOSE_SVG } from "../assets/close.svg";
import { OKX_SVG } from "../assets/okx.svg";
import { UNI_SAT_SVG } from "../assets/uni-sat.svg";
import { WillUpdateEvent } from "../events";
import {
  generateConnectingScene,
  generateSignersScene,
  generateWalletsScene,
} from "../scenes";
import { WalletWithSigners } from "../types";

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
  private walletName?: string;
  @state()
  private signerType?: ccc.SignerType;
  @state()
  private selectedWallet?: WalletWithSigners;
  private updateWallet() {
    this.selectedWallet = this.wallets.find(
      (wallet) => this.walletName === wallet.name,
    );
  }
  @state()
  private selectedSigner?: ccc.SignerInfo;
  private updateSigner() {
    this.selectedSigner = this.selectedWallet?.signers.find(
      ({ type }) => type === this.signerType,
    );
  }
  @state()
  public wallet?: WalletWithSigners;
  @state()
  public signer?: ccc.SignerInfo;
  private canConnect = false;
  private prepareSigner() {
    (async () => {
      if (!this.selectedSigner) {
        this.wallet = undefined;
        this.signer = undefined;
        return;
      }

      if (!(await this.selectedSigner.signer.isConnected())) {
        if (!this.canConnect) {
          this.disconnect();
          return;
        }
        await this.selectedSigner.signer.connect();
      }

      this.saveConnection();
      this.wallet = this.selectedWallet;
      this.signer = this.selectedSigner;
      this.closedHandler();
    })();
  }

  public disconnect() {
    this.walletName = undefined;
    this.wallet = undefined;
    this.signerType = undefined;
    this.signer = undefined;
    this.saveConnection();
  }

  private loadConnection() {
    const {
      signerType,
      walletName,
    }: { signerType?: ccc.SignerType; walletName?: string } = JSON.parse(
      window.localStorage.getItem("ccc-connection-info") ?? "{}",
    );

    this.signerType = signerType;
    this.walletName = walletName;
  }

  private saveConnection() {
    window.localStorage.setItem(
      "ccc-connection-info",
      JSON.stringify({
        signerType: this.signerType,
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
      this.updateWallet();
    }
    if (
      changedProperties.has("signerType") ||
      changedProperties.has("selectedWallet")
    ) {
      this.updateSigner();
    }
    if (changedProperties.has("selectedSigner")) {
      this.prepareSigner();
    }

    this.dispatchEvent(new WillUpdateEvent());
  }

  private reloadSigners() {
    this.wallets = [];

    (async () => {
      if (!this.selectedSigner) {
        return;
      }

      const newSigner = await this.selectedSigner.signer.replaceClient(
        this.client,
      );
      if (newSigner) {
        this.selectedSigner = {
          ...this.selectedSigner,
          signer: newSigner,
        };
      } else {
        this.disconnect();
      }
    })();

    this.resetListeners.forEach((listener) => listener());
    this.resetListeners = [];

    const uniSatSigner = ccc.UniSat.getUniSatSigner(this.client);
    if (uniSatSigner) {
      this.addSigner("UniSat", UNI_SAT_SVG, ccc.SignerType.BTC, uniSatSigner);
    }

    const okxBitcoinSigner = ccc.Okx.getOKXBitcoinSigner(this.client);
    if (okxBitcoinSigner) {
      this.addSigner(
        "OKX Wallet",
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
          signer.detail.info.icon,
          ccc.SignerType.EVM,
          signer,
        );
      }),
    );
  }

  private addSigner(
    name: string,
    icon: string,
    type: ccc.SignerType,
    signer: ccc.Signer,
  ) {
    let updated = false;
    const wallets = this.wallets.map((wallet) => {
      if (wallet.name !== name) {
        return wallet;
      }

      updated = true;
      return {
        ...wallet,
        signers: [...wallet.signers, { type, signer }],
      };
    });

    if (!updated) {
      wallets.push({
        name,
        icon,
        signers: [{ type, signer }],
      });
    }

    this.wallets = wallets;
  }

  render() {
    const [title, body] = (() => {
      if (!this.selectedWallet) {
        return generateWalletsScene(
          this.wallets,
          this.signerSelectedHandler,
          this.signerSelectedHandler,
        );
      }
      if (!this.selectedSigner) {
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

    return html`<style>
        :host {
          ${this.isOpen ? "" : "display: none;"}
          --background: #fff;
          --divider: #eee;
          --btn-primary: #f8f8f8;
          --btn-primary-hover: #efeeee;
          --btn-secondary: #ddd;
          --btn-icon: #e9e4de;
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
        <div class="main">
          <div class="header text-bold fs-big">
            <div class="back"></div>
            ${title}
            <img class="close" src=${CLOSE_SVG} @click=${this.closedHandler} />
          </div>
          <div class="body">${body}</div>
        </div>
      </div>`;
  }

  private closedHandler = () => {
    if (this.signer === undefined) {
      this.disconnect();
    }
    this.isOpen = false;
  };

  private signerSelectedHandler = (
    wallet?: ccc.Wallet,
    signer?: ccc.SignerInfo,
  ) => {
    this.walletName = wallet?.name;
    this.signerType = signer?.type;
    this.canConnect = true;
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
      transition: background 0.3s ease-in-out;
    }

    .btn-primary img {
      width: 2rem;
      height: 2rem;
      margin-right: 1rem;
      border-radius: 0.4rem;
      background: var(--btn-icon);
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
      transition: background 0.3s ease-in-out;
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
      background: var(--btn-icon);
    }

    .connecting-wallet-icon {
      width: 5rem;
      height: 5rem;
      border-radius: 1rem;
    }
  `;
}
