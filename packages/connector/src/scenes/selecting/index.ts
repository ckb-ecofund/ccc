import { ccc } from "@ckb-ccc/ccc";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { WalletWithSigners } from "../../types";
import { generateConnectingScene } from "./connecting";
import { generateSignersScene } from "./signers";
import { generateWalletsScene } from "./wallets";

export class ConnectedEvent extends Event {
  constructor(
    public readonly walletName: string,
    public readonly signerName: string,
  ) {
    super("connected");
  }
}

@customElement("ccc-selecting-scene")
export class SelectingScene extends LitElement {
  @property()
  public wallets?: WalletWithSigners[];

  @state()
  private selectedWallet?: WalletWithSigners;
  @state()
  private selectedSigner?: ccc.SignerInfo;
  @state()
  private connectingError?: string;

  render() {
    const [title, body] = (() => {
      if (!this.selectedWallet) {
        return generateWalletsScene(
          this.wallets ?? [],
          (wallet) => {
            this.selectedWallet = wallet;
          },
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
        this.connectingError,
        this.signerSelectedHandler,
      );
    })();

    return html`<ccc-dialog
      header=${title}
      ?canBack=${this.selectedSigner || this.selectedWallet}
      @close=${() => {
        this.onClose();
      }}
      @back=${() => {
        if (
          !this.selectedSigner ||
          (this.selectedWallet && this.selectedWallet.signers.length <= 1)
        ) {
          this.selectedWallet = undefined;
        }
        this.selectedSigner = undefined;
        this.connectingError = undefined;
      }}
    >
      ${body}
    </ccc-dialog>`;
  }

  public onClose() {
    this.selectedWallet = undefined;
    this.selectedSigner = undefined;
    this.connectingError = undefined;
  }

  private signerSelectedHandler = (
    wallet: WalletWithSigners,
    signerInfo: ccc.SignerInfo,
  ) => {
    this.connectingError = undefined;
    this.selectedWallet = wallet;
    this.selectedSigner = signerInfo;
    (async () => {
      const { signer } = signerInfo;
      try {
        await signer.connect();
      } catch (error) {
        if (typeof error !== "object" || error === null) {
          this.connectingError = JSON.stringify(error);
          return;
        }

        if (!("message" in error)) {
          this.connectingError = "Unknown error";
          return;
        }

        const message = error.message;
        if (typeof message === "string") {
          this.connectingError = message;
          return;
        }

        this.connectingError = JSON.stringify(message);
      }
      if (!(await signer.isConnected())) {
        return;
      }

      this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
      this.dispatchEvent(new ConnectedEvent(wallet.name, signerInfo.name));
    })();
  };

  static styles = css`
    :host {
      display: block;
    }

    .text-bold {
      font-weight: bold;
    }

    .text-tip {
      color: var(--tip-color);
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

    .text-center {
      text-align: center;
    }
  `;

  updated() {
    this.dispatchEvent(new Event("updated", { bubbles: true, composed: true }));
  }
}
