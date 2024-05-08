import { ccc } from "@ckb-ccc/ccc";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { CLOSE_SVG } from "./assets/close.svg";
import { OKX_SVG } from "./assets/okx.svg";
import { UNI_SAT_SVG } from "./assets/uni-sat.svg";
import { CloseEvent, ConnectedEvent } from "./events";
import { generateWalletsScene } from "./scenes";

@customElement("ccc-connector")
export class WebComponentConnector extends LitElement {
  @state()
  private wallets: ccc.Wallet[] = [];
  @state()
  private wallet?: ccc.Wallet;
  @state()
  private signer?: ccc.SignerInfo;

  private existedEip6963: string[] = [];

  @property()
  public isOpen: boolean = false;

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
      return [];
    })();

    return html`<style>
        :host {
          ${this.isOpen ? "" : "display: none;"}
          --background: #fff;
          --divider: #eee;
          --wallet: #f8f8f8;
          --wallet-hover: #efeeee;
          --wallet-icon: #e9e4de;
          color: #1e1e1e;
        }
      </style>
      <div
        class="background"
        @click=${(event: Event) => {
          if (event.target === event.currentTarget) {
            this.dispatchEvent(new CloseEvent());
          }
        }}
      >
        <div class="main">
          <div class="header">
            <div class="back"></div>
            ${title}
            <img
              class="close"
              src=${CLOSE_SVG}
              @click=${() => {
                this.dispatchEvent(new CloseEvent());
              }}
            />
          </div>
          <div class="body">${body}</div>
        </div>
      </div>`;
  }

  private onWalletSelected = (wallet: ccc.Wallet) => {
    this.wallet = wallet;
  };

  private onSignerSelected = (wallet: ccc.Wallet, signer: ccc.SignerInfo) => {
    this.onWalletSelected(wallet);
    this.signer = signer;

    (async () => {
      await signer.signer.connect();
      this.dispatchEvent(new ConnectedEvent(wallet, signer));
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
      font-size: 1.2rem;
      font-weight: bold;
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
    }

    .wallet {
      min-width: 20rem;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: start;
      padding: 0.75rem 1rem;
      background: var(--wallet);
      margin-bottom: 0.7rem;
      border-radius: 0.4rem;
      transition: background 0.3s ease-in-out;
    }

    .wallet:hover {
      background: var(--wallet-hover);
    }

    .wallet img {
      width: 2rem;
      height: 2rem;
      border-radius: 0.4rem;
      margin-right: 1rem;
      background: var(--wallet-icon);
    }
  `;
}
