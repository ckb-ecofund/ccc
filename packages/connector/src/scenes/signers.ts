import { ccc } from "@ckb-ccc/ccc";
import { html } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { BTC_SVG, CKB_SVG, ETH_SVG } from "../assets/chains";
import { NOSTR_SVG } from "../assets/chains/nostr.svg";
import { WalletWithSigners } from "../types";

export function signerTypeToIcon(type: ccc.SignerType): string {
  return {
    [ccc.SignerType.BTC]: BTC_SVG,
    [ccc.SignerType.EVM]: ETH_SVG,
    [ccc.SignerType.CKB]: CKB_SVG,
    [ccc.SignerType.Nostr]: NOSTR_SVG,
  }[type];
}

export function generateSignersScene(
  wallet: WalletWithSigners,
  onSignerSelected: (
    wallet: WalletWithSigners,
    signer: ccc.SignerInfo,
  ) => unknown,
) {
  return [
    "Select a Chain",

    html`
      <img class="wallet-icon" src=${wallet.icon} alt=${wallet.name} />
      <span class="mb-2">${wallet.name}</span>
      ${repeat(
        wallet.signers,
        (signer) => signer.name,
        (signer) => html`
          <button
            class="btn-primary mb-1"
            @click=${async () => {
              onSignerSelected(wallet, signer);
            }}
          >
            <img
              src=${signerTypeToIcon(signer.signer.type)}
              alt=${signer.signer.type}
            />
            ${signer.name}
          </button>
        `,
      )}
    `,
  ];
}
