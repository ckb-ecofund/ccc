import { TemplateResult, css, html, render } from "lit";

const toastStyles = css`
  .toast {
    visibility: hidden;
    min-width: 15.625rem;
    margin-left: -7.8125rem;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 0.625rem;
    padding: 1rem;
    position: fixed;
    z-index: 999;
    left: 50%;
    bottom: 50%;
    transform: translateY(50%);
    font-size: 1.0625rem;
    transition:
      visibility 0s,
      opacity 0.5s linear 0.5s;
    opacity: 0;
  }
  .toast.show {
    visibility: visible;
    opacity: 1;
    transition: opacity 0.5s linear;
  }
`;

export function Toast(message: string): TemplateResult {
  const toastTemplate = html`
    <style>
      ${toastStyles}
    </style>
    <div class="toast">${message}</div>
  `;

  const container = document.createElement("div");
  document.body.appendChild(container);
  render(toastTemplate, container);
  const toastElement = container.querySelector(".toast");

  setTimeout(() => toastElement?.classList.add("show"), 0);
  setTimeout(() => {
    toastElement?.classList.remove("show");
    setTimeout(() => document.body.removeChild(container), 500);
  }, 1500);

  return html``;
}
