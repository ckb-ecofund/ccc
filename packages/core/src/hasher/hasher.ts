import { BytesLike } from "../bytes/index.js";
import { Hex } from "../hex/index.js";

/**
 * @public
 */
export interface Hasher {
  /**
   * Updates the hash with the given data.
   *
   * @param data - The data to update the hash with.
   * @returns The current Hasher instance for chaining.
   *
   * @example
   * ```typescript
   * const hasher = new Hasher();
   * hasher.update("some data").update("more data");
   * const hash = hasher.digest();
   * ```
   */

  update(data: BytesLike): Hasher;

  /**
   * Finalizes the hash and returns the digest as a hexadecimal string.
   *
   * @returns The hexadecimal string representation of the hash.
   *
   * @example
   * ```typescript
   * const hasher = new Hasher();
   * hasher.update("some data");
   * const hash = hasher.digest(); // Outputs something like "0x..."
   * ```
   */

  digest(): Hex;
}
