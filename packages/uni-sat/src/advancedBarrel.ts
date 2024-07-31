/**
 * Interface representing a provider for interacting with accounts and signing messages.
 * @interface
 */
export interface Provider {
  /**
   * Requests user accounts.
   * @returns {Promise<string[]>} A promise that resolves to an array of account addresses.
   */
  requestAccounts(): Promise<string[]>;

  /**
   * Gets the current network.
   * @returns current network.
   */
  getNetwork(): Promise<"livenet" | "testnet">;

  /**
   * Switch the current network.
   */
  switchNetwork(chain: "livenet" | "testnet"): Promise<void>;

  /**
   * Gets the current chain.
   * @returns current chain.
   */
  getChain?(): Promise<{ enum: string; name: string; network: string }>;

  /**
   * Switch the current chain.
   */
  switchChain?(
    chain: string,
  ): Promise<{ enum: string; name: string; network: string }>;

  /**
   * Gets the current accounts.
   * @returns {Promise<string[]>} A promise that resolves to an array of account addresses.
   */
  getAccounts(): Promise<string[]>;

  /**
   * Gets the public key of the account.
   * @returns {Promise<string>} A promise that resolves to the public key.
   */
  getPublicKey(): Promise<string>;

  /**
   * Signs a message with the specified type.
   * @param {string} msg - The message to sign.
   * @param {"ecdsa" | "bip322-simple"} type - The type of signature.
   * @returns {Promise<string>} A promise that resolves to the signed message.
   */
  signMessage(msg: string, type: "ecdsa" | "bip322-simple"): Promise<string>;

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
