import { ccc } from "@ckb-ccc/ccc";
import { html } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { BTC_SVG, ETH_SVG } from "../assets/chains";

export function signerTypeToIcon(type: ccc.SignerType): string {
  return {
    [ccc.SignerType.BTC]: BTC_SVG,
    [ccc.SignerType.EVM]: ETH_SVG,
  }[type];
}

export function generateSignersScene(
  wallet: ccc.Wallet,
  onSignerSelected: (wallet: ccc.Wallet, signer: ccc.SignerInfo) => unknown,
) {
  return [
    "Select a Chain",

    html`
      <img class="wallet-icon" src=${wallet.icon} alt=${wallet.name} />
      <span class="mb-2">${wallet.name}</span>
      ${repeat(
        wallet.signers,
        (signer) => signer.type,
        (signer) => html`
          <button
            class="btn-primary mb-1"
            @click=${async () => {
              onSignerSelected(wallet, signer);
            }}
          >
            <img src=${signerTypeToIcon(signer.type)} alt=${signer.type} />
            ${signer.type}
          </button>
        `,
      )}
    `,
  ];
}
