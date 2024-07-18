import { ccc } from "@ckb-ccc/ccc";
import { html } from "lit";
import { CKB_SVG } from "../assets/chains";
import { COPY_SVG } from "../assets/copy.svg";
import { DISCONNECT_SVG } from "../assets/diconnect.svg";
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
        <img class="cursor-pointer copy-btn" src=${COPY_SVG} alt="copy" @click=${() => copyAddress(internalAddress)}/>
      </div>
      <div class="text-bold fs-md">${ccc.fixedPointToString(balance ?? ccc.Zero)} CKB</div>
      <div class="flex align-center">
        <span class="text-bold text-tip fs-md">${formatString(recommendedAddress, 13, 7)}</span>
        <img class="cursor-pointer copy-btn-sm" src=${COPY_SVG} alt="copy" @click=${() => copyAddress(recommendedAddress)}/>
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
        <div class="switch-content flex align-center ml-2 mr-2 fs-sm">
          <img class="mr-1 sm-chain-logo" src=${CKB_SVG} alt="Nervos Network">
          ${signer.signer.client.addressPrefix === "ckb" ? "Mainnet" : "Testnet"}
          ${["ckb", "ckt"].includes(signer.signer.client.addressPrefix) ? "" : ` ${signer.signer.client.addressPrefix}`}
        </div>
        <div class="switch-line"></div>
      </div>
    `,
  ];
}
