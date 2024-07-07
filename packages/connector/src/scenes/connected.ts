import { ccc } from "@ckb-ccc/ccc";
import { html } from "lit";
import { CKB_SVG } from "../assets/chains";
import { DISCONNECT_SVG } from "../assets/diconnect.svg";
import { SWAP_SVG } from "../assets/swap.svg";
import { CopyButton } from "../components/CopyButton";
import { signerTypeToIcon } from "./signers";

function copyAddress(address?: string) {
  if (!address) {
    return;
  }

  return window.navigator.clipboard.writeText(address);
}

export function formatString(
  str: string | undefined,
  l = 7,
  r = 5,
): string | undefined {
  if (str && str.length > l + r + 3) {
    return `${str.slice(0, l)}...${str.slice(-r)}`;
  }
  return str;
}

export function generateConnectedScene(
  wallet: ccc.Wallet,
  signer: ccc.SignerInfo,
  recommendedAddress: string | undefined,
  internalAddress: string | undefined,
  balance: ccc.Num | undefined,
  disconnect: () => void,
  handleSwitchClick: () => void,
) {
  return [
    undefined,
    html`
      <div class="position-relative">
        <img
          class="connecting-wallet-icon"
          src=${wallet.icon}
          alt=${wallet.name}
        />
        <img
          class="connected-type-icon"
          src=${signerTypeToIcon(signer.signer.type)}
          alt=${signer.signer.type}
        >
        </img>
      </div>
      
      <div class="flex align-center mt-2">
        <span class="text-bold fs-xl">${formatString(internalAddress)}</span>
        ${CopyButton(internalAddress ?? "")}      
      </div>
      <div class="text-bold fs-md">${ccc.fixedPointToString(balance ?? ccc.Zero)} CKB</div>
      <div class="flex align-center">
        <span class="text-bold text-tip fs-md">${formatString(recommendedAddress, 13, 7)}</span>
        ${CopyButton(recommendedAddress ?? "")}  
      </div>

      <button
        class="btn-primary mt-2"
        @click=${disconnect}
      >
        <img
          src=${DISCONNECT_SVG}
          alt="disconnect"
        />
        Disconnect
      </button>

      <div class="switch-btn-container align-center flex justify-center mt-1">
        <div class="switch-line"></div>
        <div class="switch-content flex align-center cursor-pointer ml-2 mr-2 fs-sm" @click=${handleSwitchClick}>
          <img class="mr-1 sm-chain-logo" src=${CKB_SVG} alt="Nervos Network">
          ${signer.signer.client.addressPrefix === "ckb" ? "Mainnet" : "Testnet"}
          ${["ckb", "ckt"].includes(signer.signer.client.addressPrefix) ? "" : ` ${signer.signer.client.addressPrefix}`}
          <img class="ml-1" src=${SWAP_SVG} alt="Nervos Network">
        </div>
        <div class="switch-line"></div>
      </div>
    `,
  ];
}
