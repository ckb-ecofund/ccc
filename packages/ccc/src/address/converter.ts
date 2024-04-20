import { Client, KnownScript } from "../client";
import { Script } from "../types";
import { toHex, decodeScript, encodeScript } from "../codec";
import { AddressPlain } from "./addressPlain";
import {
  AddressFormat,
  BECH32_LIMIT,
  getClientFromAddressPrefix,
  parseAddress,
} from "./advanced";
import { AddressKnownScript } from "./addressKnownScript";
import { Address } from "./address";
import { bech32m } from "bech32";

export function decodeAddressFromString(
  address: string,
  getClient?: (prefix: string) => Client | undefined,
): Address {
  const { prefix, format, body } = parseAddress(address);

  const client = getClient?.(prefix) ?? getClientFromAddressPrefix(prefix);
  if (!client) {
    throw new Error(`Unknown address prefix ${prefix}`);
  }

  if (format === AddressFormat.Full) {
    if (body.length < 32 + 1) {
      throw new Error(`Invalid address without enough payload ${address}`);
    }

    return new AddressPlain(decodeScript(body), client);
  }

  if (format === AddressFormat.FullData) {
    if (body.length < 32) {
      throw new Error(`Invalid address without enough payload ${address}`);
    }

    return new AddressPlain(
      {
        codeHash: toHex(body.slice(0, 32)),
        hashType: "data",
        args: toHex(body.slice(32)),
      },
      client,
    );
  }

  if (format === AddressFormat.FullType) {
    if (body.length < 32) {
      throw new Error(`Invalid address without enough payload ${address}`);
    }

    return new AddressPlain(
      {
        codeHash: toHex(body.slice(0, 32)),
        hashType: "type",
        args: toHex(body.slice(32)),
      },
      client,
    );
  }

  // format === AddressFormat.Short
  if (body.length !== 21) {
    throw new Error(`Invalid address without enough payload ${address}`);
  }
  const script = [
    KnownScript.Secp256k1Blake160,
    KnownScript.Secp256k1Multisig,
    KnownScript.AnyoneCanPay,
  ][body[0]];
  if (script === undefined) {
    throw new Error(
      `Invalid short format address with unknown script ${address}`,
    );
  }

  return new AddressKnownScript(script, toHex(body.slice(1)), client);
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
