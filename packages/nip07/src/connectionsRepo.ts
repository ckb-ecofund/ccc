import { ccc } from "@ckb-ccc/core";

/**
 * Type representing a connection with public key.
 * @typedef {Object} Connection
 * @property {ccc.Hex} publicKey - The public key of the connection.
 */
export type Connection = {
  readonly publicKey: ccc.Hex;
};

/**
 * Interface representing a repository for managing connections.
 * @interface
 */
export interface ConnectionsRepo {
  /**
   * Gets a connection.
   * @returns {Promise<Connection | undefined>} A promise that resolves to the connection, if found.
   */
  get(): Promise<Connection | undefined>;

  /**
   * Sets a connection.
   * @param {Connection | undefined} connection - The connection to set.
   * @returns {Promise<void>} A promise that resolves when the connection is set.
   */
  set(connection: Connection | undefined): Promise<void>;
}

/**
 * Class representing a local storage-based repository for managing connections.
 * @class
 * @implements {ConnectionsRepo}
 */
export class ConnectionsRepoLocalStorage implements ConnectionsRepo {
  /**
   * Creates an instance of ConnectionsRepoLocalStorage.
   * @param {string} [storageKey="ccc-nip07-signer"] - The local storage key.
   */
  constructor(private readonly storageKey = "ccc-nip07-signer") {}

  /**
   * Gets a connection.
   * @returns {Promise<Connection | undefined>} A promise that resolves to the connection, if found.
   */
  async get(): Promise<Connection | undefined> {
    const got = window.localStorage.getItem(this.storageKey);
    return got ? JSON.parse(got) : undefined;
  }

  /**
   * Sets a connection.
   * @param {Connection | undefined} connection - The connection to set.
   * @returns {Promise<void>}
   */
  async set(connection: Connection | undefined): Promise<void> {
    if (connection === undefined) {
      window.localStorage.removeItem(this.storageKey);
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(connection));
  }
}
