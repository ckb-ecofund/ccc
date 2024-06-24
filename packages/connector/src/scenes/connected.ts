import { ccc } from "@ckb-ccc/ccc";
import { html } from "lit";
import { CKB_SM_SVG } from "../assets/chains/ckb.sm.svg";
import { COPY_SM_SVG } from "../assets/copy.sm.svg";
import { COPY_SVG } from "../assets/copy.svg";
import { DISCONNECT_SVG } from "../assets/diconnect.svg";
import { SWAP_SVG } from "../assets/swap.svg";
import { signerTypeToIcon } from "./signers";

export function formatString(
  str: string | undefined,
  maxLen: number = 15,
): string | undefined {
  if (str && str.length > maxLen) {
    return `${str.slice(0, 8)}......${str.slice(-4)}`;
  }
  return str;
}

export function generateConnectedScene(
  wallet: ccc.Wallet,
  signer: ccc.SignerInfo,
  recommendedAddress: string | undefined,
  internalAddress: string | undefined,
  balance: string | undefined,
  disconnect: () => void,
  handleSwitchClick: () => void,
) {
  async function copyAddress(address: string) {
    await window.navigator.clipboard.writeText(address);
  }

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
        <div class="flex">
          <span class="block text-bold fs-semi-big font-montserrat font-black"> ${formatString(internalAddress)}</span>
          <img class="hover" src=${COPY_SVG} alt="copy" @click=${async () => {
            internalAddress && (await copyAddress(internalAddress));
          }}/>
        </div>
        <span class="block text-bold fs-md font-montserrat font-black">${balance} CKB</span>
        <div class="flex justify-center">
          <span class="block text-bold font-gray fs-md font-montserrat font-black">CKB ${formatString(recommendedAddress)}</span>
          <img class="hover" src=${COPY_SM_SVG} alt="copy" @click=${async () => {
            recommendedAddress && (await copyAddress(recommendedAddress));
          }}/>
        </div>
        
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
