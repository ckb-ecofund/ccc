import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("ccc-button")
export class Button extends LitElement {
  static styles = css`
    :host {
      width: 100%;
    }

    button {
      background: none;
      color: inherit;
      border: none;
      padding: 0;
      font: inherit;
      cursor: pointer;
      outline: inherit;

      width: 100%;
      display: flex;
      align-items: center;
      justify-content: start;
      padding: 0.75rem 1rem;
      background: var(--btn-primary);
      border-radius: 0.4rem;
      transition: background 0.15s ease-in-out;
    }
    button:hover {
      background: var(--btn-primary-hover);
    }
    button:disabled {
      cursor: not-allowed;
    }
    button:disabled:hover {
      background: var(--btn-primary);
    }

    button ::slotted(img) {
      width: 2rem;
      height: 2rem;
      margin-right: 1rem;
      border-radius: 0.4rem;
    }
  `;

  updated() {
    this.dispatchEvent(new Event("updated", { bubbles: true, composed: true }));
  }

  render() {
    return html`<button><slot></slot></button>`;
  }
}
