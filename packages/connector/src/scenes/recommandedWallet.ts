import { METAMASK_SVG } from "../assets/metamask.svg";
import { OKX_SVG } from "../assets/okx.svg";
import { RETRY_SVG } from "../assets/retry.svg";
import { UNI_SAT_SVG } from "../assets/uni-sat.svg";

export interface WalletInfo {
  name: string;
  icon: string;
  downloadLink: string;
}

export const recommendedWallets: WalletInfo[] = [
  {
    name: "MetaMask",
    icon: METAMASK_SVG,
    downloadLink: "https://metamask.app.link/dapp/yourwebsite",
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
  }
];