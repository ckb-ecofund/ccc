import { Client, KnownScript } from "../client";
import { HexString, Script } from "../types";
import { AddressPlain } from "./addressPlain";
import {
  decodeAddressInfo,
  getClientFromAddressPrefix,
  parseAddress,
} from "./factory.advanced";
import { Address } from "./address";
import { AddressKnownScript } from ".";

export function decodeAddressFromString(
  address: string,
  getClient?: (prefix: string) => Client | undefined,
): Address {
  const { prefix, format, payload } = parseAddress(address);

  const client = getClient?.(prefix) ?? getClientFromAddressPrefix(prefix);
  if (!client) {
    throw new Error(`Unknown address prefix ${prefix}`);
  }

  return decodeAddressInfo(format, payload, client);
}

export function decodeAddressFromScript(
  script: Script,
  client: Client,
): AddressPlain {
  return new AddressPlain(script, client);
}

export function decodeAddressFromKnownScript(
  script: KnownScript,
  args: HexString,
  client: Client,
): AddressKnownScript {
  return new AddressKnownScript(script, args, client);
}
