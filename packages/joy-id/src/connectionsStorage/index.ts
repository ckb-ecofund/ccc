import { ccc } from "@ckb-ccc/core";

export type AccountSelector = {
  uri: string;
  addressType: string;
};

export function isSelectorEq(a: AccountSelector, b: AccountSelector) {
  return a.uri === b.uri && a.addressType === b.addressType;
}

export type Connection = {
  readonly address: string;
  readonly publicKey: ccc.Hex;
  readonly keyType: string;
};

export interface ConnectionsRepo {
  get(selector: AccountSelector): Promise<Connection | undefined>;
  set(
    selector: AccountSelector,
    connection: Connection | undefined,
  ): Promise<void>;
}

export class ConnectionsRepoLocalStorage implements ConnectionsRepo {
  constructor(private readonly storageKey = "ccc-joy-id-signer") {}

  async readConnections(): Promise<[AccountSelector, Connection][]> {
    return JSON.parse(window.localStorage.getItem(this.storageKey) ?? "[]");
  }

  async get(selector: AccountSelector): Promise<Connection | undefined> {
    return (await this.readConnections()).find(([s]) =>
      isSelectorEq(selector, s),
    )?.[1];
  }

  async set(selector: AccountSelector, connection: Connection | undefined) {
    const connections = await this.readConnections();

    if (connection) {
      const existed = connections.find(([s]) => isSelectorEq(s, selector));
      if (existed) {
        existed[1] = connection;
      } else {
        connections.push([selector, connection]);
      }
      window.localStorage.setItem(this.storageKey, JSON.stringify(connections));
    } else {
      window.localStorage.setItem(
        this.storageKey,
        JSON.stringify(connections.filter(([s]) => !isSelectorEq(s, selector))),
      );
    }
  }
}
