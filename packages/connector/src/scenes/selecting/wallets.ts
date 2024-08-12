import { ccc } from "@ckb-ccc/ccc";
import { html } from "lit";
import { repeat } from "lit/directives/repeat.js";

export function generateWalletsScene(
  wallets: ccc.WalletWithSigners[],
  onWalletSelected: (wallet: ccc.WalletWithSigners) => unknown,
  onSignerSelected: (
    wallet: ccc.WalletWithSigners,
    signer: ccc.SignerInfo,
  ) => unknown,
) {
  return [
    "Connect Wallet",
    repeat(
      wallets,
      (wallet) => wallet.name,
      (wallet) => html`
        <ccc-button
          class="mt-1"
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
        </ccc-button>
      `,
    ),
  ];
}
