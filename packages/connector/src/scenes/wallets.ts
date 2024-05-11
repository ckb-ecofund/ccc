import { ccc } from "@ckb-ccc/ccc";
import { html } from "lit";
import { repeat } from "lit/directives/repeat.js";

export function generateWalletsScene(
  wallets: ccc.Wallet[],
  onWalletSelected: (wallet: ccc.Wallet) => unknown,
  onSignerSelected: (wallet: ccc.Wallet, signer: ccc.SignerInfo) => unknown,
) {
  return [
    "Connect Wallet",
    repeat(
      wallets,
      (wallet) => wallet.name,
      (wallet) => html`
        <button
          class="btn-primary mb-1"
          @click=${async () => {
            if (wallet.signers.length === 1) {
              onSignerSelected(wallet, wallet.signers[0]);
            } else {
              onWalletSelected(wallet);
            }
          }}
        >
          <img src=${wallet.icon} alt=${wallet.name} />
          ${wallet.name}
        </button>
      `,
    ),
  ];
}
