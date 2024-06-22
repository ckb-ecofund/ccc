import { ccc } from "@ckb-ccc/ccc";
import { html } from "lit";
import { RETRY_SVG } from "../assets/retry.svg";
import { WalletWithSigners } from "../types";

export function generateConnectingScene(
  wallet: WalletWithSigners,
  signer: ccc.SignerInfo,
  onSignerSelected: (
    wallet: WalletWithSigners,
    signer: ccc.SignerInfo,
  ) => unknown,
) {
  return [
    wallet.name,
    html`
      <img
        class="connecting-wallet-icon mb-1"
        src=${wallet.icon}
        alt=${wallet.name}
      />
      <span class="text-bold">Opening ${wallet.name}...</span>
      <span class="text-tip">Confirm connection in the wallet</span>
      <button
        class="btn-secondary mt-2 mb-2"
        @click=${() => onSignerSelected(wallet, signer)}
      >
        <img src=${RETRY_SVG} alt="retry" />
        Try again
      </button>
    `,
  ];
}
