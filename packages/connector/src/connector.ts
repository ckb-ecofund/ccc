import { ccc } from "@ckb-ccc/ccc";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

export enum SignerType {
  Eip6963 = "Eip6963",
}

export class SignerInfo {
  constructor(
    public type: SignerType,
    public id: string,
    public name: string,
    public icon: string,
    public signer: ccc.Signer,
  ) {}
}

export class ConnectedEvent extends Event {
  constructor(public readonly signerInfo: SignerInfo) {
    super("connected", { composed: true });
  }
}

@customElement("ccc-connector")
export class WebComponentConnector extends LitElement {
  @state()
  private signers: SignerInfo[] = [];

  connectedCallback(): void {
    super.connectedCallback();

    const client = new ccc.ClientPublicMainnet();
    const eip6963Manager = new ccc.Eip6963.SignerFactory(client);
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

  render() {
    return html`<div>
      ${repeat(
        this.signers,
        (signer) => signer.id,
        (signer) => html`
          <button
            @click=${async () => {
              await signer.signer.connect();
              this.dispatchEvent(new ConnectedEvent(signer));
            }}
          >
            <img src=${signer.icon} alt=${signer.name} />
            Connect ${signer.name}
          </button>
        `,
      )}
    </div>`;
  }
}
