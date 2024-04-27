import { ClientPublicMainnet, Eip6963 } from "@ckb-ccc/ccc";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { CloseEvent, ConnectedEvent } from "./events";
import { SignerInfo, SignerType } from "./signers";

@customElement("ccc-connector")
export class WebComponentConnector extends LitElement {
  @state()
  private signers: SignerInfo[] = [];

  @property()
  public isOpen: boolean = false;

  connectedCallback(): void {
    super.connectedCallback();

    const client = new ClientPublicMainnet();
    const eip6963Manager = new Eip6963.SignerFactory(client);
    eip6963Manager.subscribeSigners((signer) => {
      if (this.signers.some((s) => s.id === signer.detail.info.uuid)) {
        return;
      }
      this.signers = [
        ...this.signers,
        {
          id: signer.detail.info.uuid,
          name: signer.detail.info.name,
          icon: signer.detail.info.icon,
          type: SignerType.Eip6963,
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
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.25rem;
      color: #fff;
      background: #000;
      background-image: none;
      border-radius: 9999px;
      border: none;
    }

    .wallet-button img {
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
                Connect ${signer.name}
              </button>
            `,
          )}
        </div>
      </div>`;
  }
}
