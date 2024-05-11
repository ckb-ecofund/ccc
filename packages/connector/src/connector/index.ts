import { ccc } from "@ckb-ccc/ccc";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { CLOSE_SVG } from "../assets/close.svg";
import { OKX_SVG } from "../assets/okx.svg";
import { UNI_SAT_SVG } from "../assets/uni-sat.svg";
import { CloseEvent, SignerChangedEvent, StatusChangedEvent } from "../events";
import {
  generateConnectingScene,
  generateSignersScene,
  generateWalletsScene,
} from "../scenes";
import { ConnectorStatus } from "../status";

@customElement("ccc-connector")
export class WebComponentConnector extends LitElement {
  @state()
  private wallets: ccc.Wallet[] = [];
  private existedEip6963: string[] = [];

  @property()
  public isOpen: boolean = false;

  @property()
  public wallet?: ccc.Wallet;
  @property()
  public signer?: ccc.SignerInfo;
  @property()
  public status: ConnectorStatus = ConnectorStatus.SelectingSigner;

  connectedCallback(): void {
    super.connectedCallback();

    const client = new ccc.ClientPublicTestnet();
    const uniSatSigner = ccc.UniSat.getUniSatSigner(client);
    if (uniSatSigner) {
      this.addSigner("UniSat", UNI_SAT_SVG, ccc.SignerType.BTC, uniSatSigner);
    }

    const okxBitcoinSigner = ccc.Okx.getOKXBitcoinSigner(client);
    if (okxBitcoinSigner) {
      this.addSigner(
        "OKX Wallet",
        OKX_SVG,
        ccc.SignerType.BTC,
        okxBitcoinSigner,
      );
    }

    const eip6963Manager = new ccc.Eip6963.SignerFactory(client);
    eip6963Manager.subscribeSigners((signer) => {
      if (this.existedEip6963.indexOf(signer.detail.info.uuid) !== -1) {
        return;
      }
      this.existedEip6963.push(signer.detail.info.uuid);
      this.addSigner(
        `${signer.detail.info.name}`,
        signer.detail.info.icon,
        ccc.SignerType.EVM,
        signer,
      );
    });
  }

  addSigner(
    name: string,
    icon: string,
    type: ccc.SignerType,
    signer: ccc.Signer,
  ) {
    const wallet = this.wallets.find((wallet) => wallet.name === name);
    if (wallet) {
      wallet.signers.push({ type, signer });
      this.wallets = [...this.wallets];
    } else {
      this.wallets = [
        ...this.wallets,
        {
          name,
          icon,
          signers: [{ type, signer }],
        },
      ];
    }
  }

  render() {
    const [title, body] = (() => {
      if (!this.wallet) {
        return generateWalletsScene(
          this.wallets,
          this.onWalletSelected,
          this.onSignerSelected,
        );
      }
      if (!this.signer) {
        return generateSignersScene(this.wallet, this.onSignerSelected);
      }
      return generateConnectingScene(
        this.wallet,
        this.signer,
        this.onSignerSelected,
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
            this.onClose();
          }
        }}
      >
        <div class="main">
          <div class="header text-bold fs-big">
            <div class="back"></div>
            ${title}
            <img class="close" src=${CLOSE_SVG} @click=${this.onClose} />
          </div>
          <div class="body">${body}</div>
        </div>
      </div>`;
  }

  private onClose = () => {
    this.dispatchEvent(new SignerChangedEvent());
    this.dispatchEvent(new CloseEvent());
  };

  private onWalletSelected = (wallet: ccc.Wallet) => {
    this.dispatchEvent(new SignerChangedEvent(wallet, this.signer));
  };

  private onSignerSelected = (wallet: ccc.Wallet, signer: ccc.SignerInfo) => {
    this.dispatchEvent(new StatusChangedEvent(ConnectorStatus.Connecting));
    this.dispatchEvent(new SignerChangedEvent(wallet, signer));

    (async () => {
      await signer.signer.connect();
      this.dispatchEvent(new StatusChangedEvent(ConnectorStatus.Idle));
      this.dispatchEvent(new CloseEvent());
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
