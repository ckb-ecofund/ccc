import { bech32m } from "bech32";
import { bytesConcat, bytesFrom } from "../bytes";
import { Script, ScriptLike, hashTypeToBytes } from "../ckb";
import { Client, KnownScript } from "../client";
import { HexLike } from "../hex";
import {
  ADDRESS_BECH32_LIMIT,
  AddressFormat,
  addressFromPayload,
  addressPayloadFromString,
} from "./address.advanced";

export type AddressLike = {
  script: ScriptLike;
  prefix: string;
};
export class Address {
  constructor(
    public script: Script,
    public prefix: string,
  ) {}

  static from(address: AddressLike): Address {
    if (address instanceof Address) {
      return address;
    }

    return new Address(Script.from(address.script), address.prefix);
  }

  static async fromString(
    address: string,
    clients: Client | Record<string, Client>,
  ): Promise<Address> {
    const { prefix, format, payload } = addressPayloadFromString(address);

    const client = (clients as Record<string, Client>)[prefix] ?? clients;
    if (!client) {
      throw new Error(`Unknown address prefix ${prefix}`);
    }
    const expectedPrefix = await client.getAddressPrefix();
    if (expectedPrefix !== prefix) {
      throw new Error(
        `Unknown address prefix ${prefix}, expected ${expectedPrefix}`,
      );
    }

    return Address.from(
      await addressFromPayload(prefix, format, payload, client),
    );
  }

  static async fromScript(
    script: ScriptLike,
    client: Client,
  ): Promise<Address> {
    return new Address(Script.from(script), await client.getAddressPrefix());
  }

  static async fromKnownScript(
    script: KnownScript,
    args: HexLike,
    client: Client,
  ) {
    return new Address(
      Script.from({
        ...(await client.getKnownScript(script)),
        args,
      }),
      await client.getAddressPrefix(),
    );
  }

  toString(): string {
    const data = bytesConcat(
      [AddressFormat.Full],
      bytesFrom(this.script.codeHash),
      hashTypeToBytes(this.script.hashType),
      bytesFrom(this.script.args),
    );

    return bech32m.encode(
      this.prefix,
      bech32m.toWords(data),
      ADDRESS_BECH32_LIMIT,
    );
  }
}
