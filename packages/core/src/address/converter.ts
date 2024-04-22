import { Client } from "../client";
import { Script } from "../types";
import { encodeScript } from "../codec";
import { AddressPlain } from "./addressPlain";
import {
  AddressFormat,
  BECH32_LIMIT,
  decodeAddressInfo,
  getClientFromAddressPrefix,
  parseAddress,
} from "./advanced";
import { Address } from "./address";
import { bech32m } from "bech32";

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

export function encodeScriptToAddress(prefix: string, script: Script) {
  const data = [AddressFormat.Full, ...encodeScript(script)];

  return bech32m.encode(prefix, bech32m.toWords(data), BECH32_LIMIT);
}
