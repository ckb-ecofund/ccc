import { ccc } from "@ckb-ccc/ccc";
import { html } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { WalletWithSigners } from "../types";
import { recommendedWallets, WalletInfo } from "./recommandedWallet";

export function generateWalletsScene(
  wallets: WalletWithSigners[],
  onWalletSelected: (wallet: ccc.Wallet) => unknown,
  onSignerSelected: (wallet: ccc.Wallet, signer: ccc.SignerInfo) => unknown,
) {
  const missingWallets = recommendedWallets.filter(
    (recommendedWallet) =>
      !wallets.some((wallet) => wallet.name === recommendedWallet.name),
  );

  const additionalButtons = missingWallets.map(
    (wallet: WalletInfo) => html`
        <button
          class="btn-primary mb-1"
          @click=${() => {
            window.open(wallet.downloadLink, "_blank");
          }}
        >
           <img class="wallet-icon" src=${wallet.icon} alt=${wallet.name} />
          ${wallet.name}
        </button>
    `,
  );
  
  return [
    "Connect Wallet",
    html`
      ${repeat(
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
      )}
      ${additionalButtons}
    `,
    ];
}
