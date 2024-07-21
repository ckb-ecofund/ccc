import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { CLOSE_SVG } from "../assets/close.svg";
import { LEFT_SVG } from "../assets/left.svg";

@customElement("ccc-dialog")
export class Dialog extends LitElement {
  @property()
  public canBack: any | undefined;
  @property()
  public header?: string;

  render() {
    return html`
      <div
        class="header text-bold fs-lg ${this.header ? "header-divider" : ""}"
      >
        <img
          class="back ${this.canBack !== undefined ? "active" : ""}"
          src=${LEFT_SVG}
          @click=${() => {
            this.dispatchEvent(new Event("back"));
          }}
        />
        ${this.header}
        <img
          class="close active"
          src=${CLOSE_SVG}
          @click=${() => {
            this.dispatchEvent(
              new Event("close", { bubbles: true, composed: true }),
            );
          }}
        />
      </div>
      <div class="body">
        <slot></slot>
      </div>
    `;
  }

  static styles = css`
    .text-bold {
      font-weight: bold;
    }

    .fs-lg {
      font-size: 1.2rem;
    }

    .main {
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background: var(--background);
      border-radius: 1.2rem;
      overflow: hidden;
      transition: height 0.15s ease-out;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.3rem 0.5rem;
    }

    .header-divider {
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--divider);
      margin-bottom: 0.3rem;
    }

    .close,
    .back {
      width: 0.8rem;
      height: 0.8rem;
      opacity: 0;
      transition: opacity 0.15s ease-in-out;
    }

    .close.active,
    .back.active {
      opacity: 1;
      cursor: pointer;
    }

    .body {
      padding: 0 1.3rem 1rem;
      min-width: 20rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  `;
}
