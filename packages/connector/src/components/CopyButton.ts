import { TemplateResult, css, html } from "lit";
import { COPY_SVG } from "../assets/copy.svg";
import { Toast } from "./Toast";

const copyButtonStyles = css`
  .copy-btn {
    cursor: pointer;
  }
  .copy-btn:hover {
    filter: brightness(1.2);
  }
  .copy-btn:active {
    filter: brightness(0.8);
  }
`;

export function copyAddress(address: string): void {
  if (address) {
    window.navigator.clipboard.writeText(address).then(() => {
      Toast("Address copied to clipboard!");
    });
  }
}

export function CopyButton(address: string): TemplateResult {
  return html`
    <style>
      ${copyButtonStyles}
    </style>
    <img
      class="copy-btn"
      src=${COPY_SVG}
      alt="Copy"
      @click=${() => copyAddress(address)}
      title="Copy to clipboard"
    />
  `;
}
