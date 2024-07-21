import { Nip07A } from "@ckb-ccc/nip07/advanced";

export interface BitcoinProvider {
  connect(): Promise<{
    address: string;
    publicKey: string;
    compressedPublicKey: string;
  }>;

  getSelectedAccount(): Promise<{
    address: string;
    publicKey: string;
    compressedPublicKey: string;
  } | null>;

  signMessage(msg: string, type: "ecdsa" | "bip322-simple"): Promise<string>;

  /**
   * Adds an event listener to the provider.
   */
  on: BitcoinOnMethod;

  /**
   * Removes an event listener from the provider.
   * @param eventName - The name of the event to remove the listener from.
   * @param listener - The listener function to remove.
   * @returns The provider instance.
   */
  removeListener(
    eventName: string,
    listener: (...args: unknown[]) => unknown,
  ): BitcoinProvider;
}

/**
 * Interface representing a method to add event listeners to the provider.
 * @interface
 */
export interface BitcoinOnMethod {
  /**
   * Adds an event listener to the provider.
   * @param eventName - The name of the event.
   * @param listener - The listener function.
   * @returns The provider instance.
   */
  (
    eventName: string,
    listener: (...args: unknown[]) => unknown,
  ): BitcoinProvider;
}

export interface NostrProvider extends Nip07A.Provider {
  selectedAccount: { address: string; publicKey: string } | null;

  connect(): Promise<void>;

  /**
   * Adds an event listener to the provider.
   */
  on: NostrOnMethod;

  /**
   * Removes an event listener from the provider.
   * @param eventName - The name of the event to remove the listener from.
   * @param listener - The listener function to remove.
   * @returns The provider instance.
   */
  removeListener(
    eventName: string,
    listener: (...args: unknown[]) => unknown,
  ): NostrProvider;
}

/**
 * Interface representing a method to add event listeners to the provider.
 * @interface
 */
export interface NostrOnMethod {
  /**
   * Adds an event listener to the provider.
   * @param eventName - The name of the event.
   * @param listener - The listener function.
   * @returns The provider instance.
   */
  (eventName: string, listener: (...args: unknown[]) => unknown): Promise<void>;
}
