import { ccc } from "@ckb-ccc/ccc";
import { html } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { WalletInfo, WalletWithSigners } from "../types";
import { METAMASK_SVG } from "../assets/metamask.svg";
import { OKX_SVG } from "../assets/okx.svg";
import { UNI_SAT_SVG } from "../assets/uni-sat.svg";

export function generateWalletsScene(
  wallets: WalletWithSigners[],
  onWalletSelected: (wallet: ccc.Wallet) => unknown,
  onSignerSelected: (wallet: ccc.Wallet, signer: ccc.SignerInfo) => unknown,
) {

  const recommendedWallets = [{
    name: "MetaMask",
    icon: METAMASK_SVG,
    downloadLink: `https://metamask.app.link/dapp/${window.location.href}`,
  },
  {
    name: "OKX Wallet",
    icon: OKX_SVG,
    downloadLink: "https://www.okx.com/zh-hans/download",
  },
  {
    name: "UniSat",
    icon: UNI_SAT_SVG,
    downloadLink: "https://unisat.io/",
  }]

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
          <img src=${wallet.icon} alt=${wallet.name} />
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
