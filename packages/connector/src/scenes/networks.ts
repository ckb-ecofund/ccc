import { html } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { ccc } from "..";
import { CKB_SVG } from "../assets/chains";

export function generateNetworksScene(
  client: ccc.Client,
  handleSwapClick: (client: ccc.Client) => unknown,
) {
  const isMainnet = client.addressPrefix === "ckb";

  return [
    "Switch Network",
    repeat(
      [
        {
          activated: isMainnet,
          name: "Mainnet",
          onClick: () => handleSwapClick(new ccc.ClientPublicMainnet()),
        },
        {
          activated: !isMainnet,
          name: "Testnet",
          onClick: () => handleSwapClick(new ccc.ClientPublicTestnet()),
        },
      ],
      ({ name }) => name,
      ({ activated, name, onClick }) => html`
        <button
          class="btn-primary flex justify-between mb-1 ${activated
            ? "switching-active"
            : ""}"
          ?disabled=${activated}
          @click=${onClick}
        >
          <div class="flex align-center">
            <img src=${CKB_SVG} alt="Nervos Network" />
            <span>${name}</span>
          </div>
          <div class="flex align-center">
            ${activated ? html`<div class="switching-status-dot"></div>` : ""}
          </div>
        </button>
      `,
    ),
  ];
}
