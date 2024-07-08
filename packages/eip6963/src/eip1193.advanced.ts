import { Hex } from "@ckb-ccc/core";

/**
 * Interface representing a provider for interacting with Ethereum-compatible wallets.
 * @interface
 */
export interface Provider {
  /**
   * Sends a request to the provider.
   * @type {RequestMethod}
   */
  request: RequestMethod;

  /**
   * Adds an event listener to the provider.
   * @type {OnMethod}
   */
  on: OnMethod;

  /**
   * Removes an event listener from the provider.
   * @param {string} eventName - The name of the event to remove the listener from.
   * @param {(...args: unknown[]) => unknown} listener - The listener function to remove.
   * @returns {Provider} The provider instance.
   */
  removeListener(
    eventName: string,
    listener: (...args: unknown[]) => unknown,
  ): Provider;
}

/**
 * Interface representing a method to send requests to the provider.
 * @interface
 */
export interface RequestMethod {
  /**
   * Signs a message with the personal account.
   * @param {object} request - The request object.
   * @param {"personal_sign"} request.method - The method name.
   * @param {[string, Hex]} request.params - The method parameters.
   * @returns {Promise<Hex>} A promise that resolves to the signed message.
   */
  (request: { method: "personal_sign"; params: [string, Hex] }): Promise<Hex>;

  /**
   * Requests the accounts from the provider.
   * @param {object} request - The request object.
   * @param {"eth_requestAccounts"} request.method - The method name.
   * @param {undefined} [request.params] - The optional method parameters.
   * @returns {Promise<Hex[]>} A promise that resolves to an array of account addresses.
   */
  (request: {
    method: "eth_requestAccounts";
    params?: undefined;
  }): Promise<Hex[]>;

  /**
   * Gets the accounts from the provider.
   * @param {object} request - The request object.
   * @param {"eth_accounts"} request.method - The method name.
   * @param {undefined} [request.params] - The optional method parameters.
   * @returns {Promise<Hex[]>} A promise that resolves to an array of account addresses.
   */
  (request: { method: "eth_accounts"; params?: undefined }): Promise<Hex[]>;

  /**
   * Sends a generic request to the provider.
   * @param {object} request - The request object.
   * @param {string} request.method - The method name.
   * @param {Array<unknown> | Record<string, unknown>} [request.params] - The optional method parameters.
   * @returns {Promise<unknown>} A promise that resolves to the response from the provider.
   */
  (request: {
    method: string;
    params?: Array<unknown> | Record<string, unknown>;
  }): Promise<unknown>;
}

/**
 * Interface representing a method to add event listeners to the provider.
 * @interface
 */
export interface OnMethod {
  /**
   * Adds an event listener to the provider.
   * @param {string} eventName - The name of the event.
   * @param {(...args: unknown[]) => unknown} listener - The listener function.
   * @returns {Provider} The provider instance.
   */
  (eventName: string, listener: (...args: unknown[]) => unknown): Provider;
}
