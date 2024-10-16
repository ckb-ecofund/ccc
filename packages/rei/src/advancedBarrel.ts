import { ccc } from "@ckb-ccc/core";
import { cccA } from "@ckb-ccc/core/advanced";

/**
 * Interface representing a provider for interacting with accounts and signing messages.
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
   * Checks if rei wallet is connected.
   * @returns A promise that resolves to true if connected, false otherwise.
   */
  isConnected(): Promise<boolean>;

  /**
   * Removes an event listener from the provider.
   * @param {string} eventName - The name of the event to remove the listener from.
   * @param {(...args: unknown[]) => unknown} listener - The listener function to remove.
   * @returns {Provider} The provider instance.
   */
  off(eventName: string, listener: (...args: unknown[]) => unknown): void;
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
  (eventName: string, listener: (...args: unknown[]) => unknown): void;
}

export interface RequestMethod {
  /**
   * Requests the accounts from the provider.
   * @param request - The request object.
   * @param request.method - The method name.
   * @param request.data - The optional method parameters.
   * @returns A promise that resolves to an array of account addresses.
   */
  (request: {
    method: "ckb_requestAccounts";
    data?: undefined;
  }): Promise<string>;

  /**
   * Signs a message with the personal account.
   * @param request - The request object.
   * @param request.method - The method name.
   * @param request.data - The method parameters.
   * @returns A promise that resolves to the signed message.
   */
  (request: {
    method: "ckb_signMessage";
    data: { message: string };
  }): Promise<ccc.Hex>;

  /**
   * Gets the identity of the signer.
   * @param request - The request object.
   * @param request.method - The method name.
   * @returns A promise that resolves to the signed message.
   */
  (request: { method: "ckb_getPublicKey" }): Promise<string>;

  /**
   * Get network.
   * @param request - The request object.
   * @param request.method - The method name.
   * @param request.data - The method parameters.
   * @returns A promise that resolves to the signed message.
   */
  (request: {
    method: "ckb_switchNetwork";
    data: string;
  }): Promise<{ type: string; network: string }>;

  /**
   * Signs transaction .
   * @param request - The request object.
   * @param request.method - The method name.
   * @param request.data - The method parameters.
   * @returns A promise that resolves to the signed message.
   */

  (request: {
    method: "ckb_signTransaction";
    data: { txSkeleton: cccA.JsonRpcTransaction };
  }): Promise<ccc.Transaction>;
}
