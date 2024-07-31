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
   * @param request - The request object.
   * @param request.method - The method name.
   * @param request.params - The method parameters.
   * @returns A promise that resolves to the signed message.
   */
  (request: { method: "personal_sign"; params: [string, Hex] }): Promise<Hex>;

  /**
   * Requests the accounts from the provider.
   * @param request - The request object.
   * @param request.method - The method name.
   * @param request.params - The optional method parameters.
   * @returns A promise that resolves to an array of account addresses.
   */
  (request: {
    method: "eth_requestAccounts";
    params?: undefined;
  }): Promise<Hex[]>;

  /**
   * Gets the accounts from the provider.
   * @param request - The request object.
   * @param request.method - The method name.
   * @param request.params - The optional method parameters.
   * @returns A promise that resolves to an array of account addresses.
   */
  (request: { method: "eth_accounts"; params?: undefined }): Promise<Hex[]>;

  /**
   * Sends a generic request to the provider.
   * @param request - The request object.
   * @param request.method - The method name.
   * @param request.params - The optional method parameters.
   * @returns A promise that resolves to the response from the provider.
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
   * @param eventName - The name of the event.
   * @param listener - The listener function.
   * @returns The provider instance.
   */
  (eventName: string, listener: (...args: unknown[]) => unknown): Provider;
}
