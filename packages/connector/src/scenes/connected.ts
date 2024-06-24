import { ccc } from "@ckb-ccc/ccc";
import { html } from "lit";
import { signerTypeToIcon } from "./signers";
import { DISCONNECT_SVG } from "../assets/diconnect.svg";
import { CKB_SM_SVG } from "../assets/chains/ckb.sm.svg";
import { SWAP_SVG } from "../assets/swap.svg";

export function formatString(str: string | undefined, maxLen: number = 15): string | undefined {
  
  if (str && str.length > maxLen) {
    return `${str.slice(0, 8)}......${str.slice(-4)}`;
  }
  return str;
}

export function generateConnectedScene(
  wallet: ccc.Wallet,
  signer: ccc.SignerInfo,
  recommendedAddress: string | undefined,
  internalAddress: string |undefined,
  balance: string | undefined,
  disconnect: () => void,
  handleSwitchClick: () => void
) {

  return [
    wallet.name,
    html`
      <div class="connected-icon-container">
        <img
          class="connecting-wallet-icon mb-1"
          src=${wallet.icon}
          alt=${wallet.name}
        />
        <img
          class="connected-type-icon"
          src=${signerTypeToIcon(signer.type)}
          alt=${signer.type}
        >
        </img>
      </div>
      
      <div class="mb-2 mt-2 text-center">
        <span class="block text-bold fs-semi-big font-montserrat font-black"> ${formatString(internalAddress)}</span>
        <span class="block text-bold fs-md font-montserrat font-black">${balance} CKB</span>
        <span class="block text-bold font-gray fs-md font-montserrat font-black">CKB ${formatString(recommendedAddress)}</span>
      </div>

      <button
        class="btn-primary mb-1 font-montserrat font-black"
        @click=${disconnect}
      >
        <img
          src=${DISCONNECT_SVG}
          alt="disconnect"
        />
        Disconnect
      </button>

      <div class="switch-btn-container">
        <div class="switch-line"></div>
        <div class="switch-content hover" @click=${handleSwitchClick}>
          <img src=${CKB_SM_SVG} alt="Nervos Network">
          <span class="fs-sm">Nervos Network</span>
          <div class="arrows">
            <img src=${SWAP_SVG} alt="Nervos Network">
          </div>
        </div>
        <div class="switch-line"></div>
      </div>
    `,
  ];
}
