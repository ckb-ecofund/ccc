import { ccc } from "@ckb-ccc/core";

/**
 * Type representing an account selector with a URI and address type.
 * @typedef {Object} AccountSelector
 * @property {string} uri - The URI of the account.
 * @property {string} addressType - The address type of the account.
 */
export type AccountSelector = {
  uri: string;
  addressType: string;
};

/**
 * Checks if two AccountSelectors are equal.
 * @param {AccountSelector} a - The first account selector.
 * @param {AccountSelector} b - The second account selector.
 * @returns {boolean} True if the selectors are equal, false otherwise.
 */
export function isSelectorMatch(
  a: AccountSelector,
  filter: AccountSelector,
): boolean {
  return a.uri === filter.uri && a.addressType.startsWith(filter.addressType);
}

/**
 * Type representing a connection with an address, public key, and key type.
 * @typedef {Object} Connection
 * @property {string} address - The address of the connection.
 * @property {ccc.Hex} publicKey - The public key of the connection.
 * @property {string} keyType - The key type of the connection.
 */
export type Connection = {
  readonly address: string;
  readonly publicKey: ccc.Hex;
  readonly keyType: string;
};

/**
 * Interface representing a repository for managing connections.
 * @interface
 */
export interface ConnectionsRepo {
  /**
   * Gets a connection for the given selector.
   * @param {AccountSelector} selector - The account selector.
   * @returns {Promise<Connection | undefined>} A promise that resolves to the connection, if found.
   */
  get(selector: AccountSelector): Promise<Connection | undefined>;

  /**
   * Sets a connection for the given selector.
   * @param {AccountSelector} selector - The account selector.
   * @param {Connection | undefined} connection - The connection to set.
   * @returns {Promise<void>} A promise that resolves when the connection is set.
   */
  set(
    selector: AccountSelector,
    connection: Connection | undefined,
  ): Promise<void>;
}

/**
 * Class representing a local storage-based repository for managing connections.
 * @class
 * @implements {ConnectionsRepo}
 */
export class ConnectionsRepoLocalStorage implements ConnectionsRepo {
  /**
   * Creates an instance of ConnectionsRepoLocalStorage.
   * @param {string} [storageKey="ccc-joy-id-signer"] - The local storage key.
   */
  constructor(private readonly storageKey = "ccc-joy-id-signer") {}

  /**
   * Reads all connections from local storage.
   * @returns {Promise<[AccountSelector, Connection][]>} A promise that resolves to an array of selectors and connections.
   */
  async readConnections(): Promise<[AccountSelector, Connection][]> {
    return JSON.parse(window.localStorage.getItem(this.storageKey) ?? "[]");
  }

  /**
   * Gets a connection for the given selector.
   * @param {AccountSelector} selector - The account selector.
   * @returns {Promise<Connection | undefined>} A promise that resolves to the connection, if found.
   */
  async get(selector: AccountSelector): Promise<Connection | undefined> {
    return (await this.readConnections()).find(([s]) =>
      isSelectorMatch(selector, s),
    )?.[1];
  }

  /**
   * Sets a connection for the given selector.
   * @param {AccountSelector} selector - The account selector.
   * @param {Connection | undefined} connection - The connection to set.
   * @returns {Promise<void>}
   */
  async set(
    selector: AccountSelector,
    connection: Connection | undefined,
  ): Promise<void> {
    const connections = await this.readConnections();

    if (connection) {
      const existed = connections.find(([s]) => isSelectorMatch(s, selector));
      if (existed) {
        existed[1] = connection;
      } else {
        connections.push([selector, connection]);
      }
      window.localStorage.setItem(this.storageKey, JSON.stringify(connections));
    } else {
      window.localStorage.setItem(
        this.storageKey,
        JSON.stringify(
          connections.filter(([s]) => !isSelectorMatch(s, selector)),
        ),
      );
    }
  }
}
