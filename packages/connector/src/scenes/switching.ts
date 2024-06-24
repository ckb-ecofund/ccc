import { html } from "lit";
import { CKB_SVG } from "../assets/chains";

export function generateSwitchingScene(
  recommendedAddress: string | undefined,
  handleSwapClick: () => void,
) {
  const isMainnet = recommendedAddress?.startsWith("ckb");

  return [
    "Switch Network",
    html`
      <button
        class="btn-primary flex justify-between mb-1 font-gray font-montserrat ${isMainnet
          ? "switching-active"
          : ""}"
        @click=${() => handleSwapClick()}
      >
        <div class="flex align-center">
          <img src=${CKB_SVG} alt="mainnet" />
          <span>正式网</span>
        </div>
        <div class="flex align-center">
          ${isMainnet
            ? html`<span class="switching-connected">已连接</span>
                <div class="switching-status-dot"></div>`
            : ""}
        </div>
      </button>
      <button
        class="btn-primary flex justify-between  mb-1 font-gray font-montserrat ${!isMainnet
          ? "switching-active"
          : ""}"
        @click=${() => handleSwapClick()}
      >
        <div class="flex align-center">
          <img src=${CKB_SVG} alt="testnet" />
          <span>测试网</span>
        </div>
        <div class="flex align-center">
          ${!isMainnet
            ? html`<span class="switching-connected">已连接</span>
                <div class="switching-status-dot"></div>`
            : ""}
        </div>
      </button>
    `,
  ];
}
