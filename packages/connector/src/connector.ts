import { ccc } from "@ckb-ccc/ccc";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { OKX_SVG } from "./assets/okx.svg";
import { UNI_SAT_SVG } from "./assets/uni-sat.svg";
import { CloseEvent, ConnectedEvent } from "./events";

@customElement("ccc-connector")
export class WebComponentConnector extends LitElement {
  @state()
  private signers: ccc.SignerInfo[] = [];

  @property()
  public isOpen: boolean = false;

  connectedCallback(): void {
    super.connectedCallback();

    const client = new ccc.ClientPublicTestnet();
    const uniSatSigner = ccc.UniSat.getUniSatSigner(client);
    if (uniSatSigner) {
      this.signers = [
        ...this.signers,
        {
          id: "uni-sat",
          name: "BTC: UniSat",
          icon: UNI_SAT_SVG,
          type: ccc.SignerType.UniSat,
          signer: uniSatSigner,
        },
      ];
    }

    const okxBitcoinSigner = ccc.Okx.getOKXBitcoinSigner(client);
    if (okxBitcoinSigner) {
      this.signers = [
        ...this.signers,
        {
          id: "okx-bitcoin",
          name: "BTC: OKX",
          icon: OKX_SVG,
          type: ccc.SignerType.OkxBitcoin,
          signer: okxBitcoinSigner,
        },
      ];
    }

    const eip6963Manager = new ccc.Eip6963.SignerFactory(client);
    eip6963Manager.subscribeSigners((signer) => {
      if (this.signers.some((s) => s.id === signer.detail.info.uuid)) {
        return;
      }
      this.signers = [
        ...this.signers,
        {
          id: signer.detail.info.uuid,
          name: `ETH: ${signer.detail.info.name}`,
          icon: signer.detail.info.icon,
          type: ccc.SignerType.Eip6963,
          signer,
        },
      ];
    });
  }

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
      background: var(--background);
    }

    .main {
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    .wallet-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: start;
      padding: 0.75rem 1.25rem;
      color: #fff;
      background: #000;
      background-image: none;
      border-radius: 9999px;
      border: none;
      margin-bottom: 0.5rem;
    }

    .wallet-button img {
      width: 1.5rem;
      height: 1.5rem;
      padding-right: 0.5rem;
    }
  `;

  render() {
    return html`<style>
        :host {
          ${this.isOpen ? "" : "display: none;"}
          --background: rgba(0, 0, 0, 0.2);
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
          ${repeat(
            this.signers,
            (signer) => signer.id,
            (signer) => html`
              <button
                class="wallet-button"
                @click=${async () => {
                  await signer.signer.connect();
                  this.dispatchEvent(new ConnectedEvent(signer));
                  this.dispatchEvent(new CloseEvent());
                }}
              >
                <img src=${signer.icon} alt=${signer.name} />
                ${signer.name}
              </button>
            `,
          )}
        </div>
      </div>`;
  }
}
