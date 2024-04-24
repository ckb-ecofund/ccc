import { DeepReadonly } from "ts-essentials";
import { Client, KnownScript } from "../client";
import { Script, encodeHashType } from "../ckb";
import {
  AddressFormat,
  BECH32_LIMIT,
  Address as AdvancedAddress,
  parseAddressToPayload,
} from "./advanced";
import { bech32m } from "bech32";
import { Hex } from "../primitive";
import { concatBytes, toBytes } from "../bytes";

export class Address {
  constructor(
    public script: Script,
    public prefix: string,
  ) {}

  static async fromString(
    address: string,
    clients: Client | Record<string, Client>,
  ): Promise<Address> {
    const { prefix, format, payload } = parseAddressToPayload(address);

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

    return AdvancedAddress.fromAddressPayload(prefix, format, payload, client);
  }

  static async fromScript(
    script: DeepReadonly<Script>,
    client: Client,
  ): Promise<Address> {
    return {
      script: { ...script },
      prefix: await client.getAddressPrefix(),
    };
  }

  static async fromKnownScript(script: KnownScript, args: Hex, client: Client) {
    return {
      script: {
        ...(await client.getKnownScript(script)),
        args,
      },
      prefix: await client.getAddressPrefix(),
    };
  }

  static toString(address: DeepReadonly<Address>): string {
    const data = concatBytes(
      [AddressFormat.Full],
      toBytes(address.script.codeHash),
      encodeHashType(address.script.hashType),
      toBytes(address.script.args),
    );

    return bech32m.encode(address.prefix, bech32m.toWords(data), BECH32_LIMIT);
  }
}
