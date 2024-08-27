import { Hex } from "@ckb-ccc/core";

/**
 * Interface representing a provider for interacting with Ethereum-compatible wallets.
 */
export interface Provider {
  /**
   * Sends a request to the provider.
   */
  request: RequestMethod;

  /**
   * Adds an event listener to the provider.
   */
  on: OnMethod;

  /**
   * Removes an event listener from the provider.
   * @param eventName - The name of the event to remove the listener from.
   * @param listener - The listener function to remove.
   * @returns The provider instance.
   */
  removeListener(
    eventName: string,
    listener: (...args: unknown[]) => unknown,
  ): Provider;
}

/**
 * Interface representing a method to send requests to the provider.
 */
export interface RequestMethod {
  /**
   * Signs a message with the personal account.
   * @param request - The request object.
   * @returns A promise that resolves to the signed message.
   */
  (request: { method: "personal_sign"; params: [string, Hex] }): Promise<Hex>;

  /**
   * Requests the accounts from the provider.
   * @param request - The request object.
   * @returns A promise that resolves to an array of account addresses.
   */
  (request: {
    method: "eth_requestAccounts";
    params?: undefined;
  }): Promise<Hex[]>;

  /**
   * Gets the accounts from the provider.
   * @param request - The request object.
   * @returns A promise that resolves to an array of account addresses.
   */
  (request: { method: "eth_accounts"; params?: undefined }): Promise<Hex[]>;

  /**
   * Sends a generic request to the provider.
   * @param request - The request object.
   * @returns A promise that resolves to the response from the provider.
   */
  (request: {
    method: string;
    params?: Array<unknown> | Record<string, unknown>;
  }): Promise<unknown>;
}

/**
 * Interface representing a method to add event listeners to the provider.
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
