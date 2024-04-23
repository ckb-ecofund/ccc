import { bech32, bech32m } from "bech32";
import {
  ClientPublicTestnet,
  ClientPublicMainnet,
  Client,
  KnownScript,
} from "../client";
import { AddressKnownScript } from "./addressKnownScript";
import { AddressPlain } from "./addressPlain";
import { decodeScript, toHex } from "../codec";
import { AddressFormat, BECH32_LIMIT } from "./constants.advanced";

export function parseAddress(address: string): {
  prefix: string;
  format: AddressFormat;
  payload: number[];
} {
  // Try parse full format address
  {
    const { words, prefix } = bech32m.decode(address, BECH32_LIMIT);
    const [formatType, ...payload] = bech32m.fromWords(words);

    if (formatType === (AddressFormat.Full as number)) {
      return { prefix, format: AddressFormat.Full, payload };
    }
  }

  // Try parse legacy 2019 format address
  {
    const { prefix, words } = bech32.decode(address, BECH32_LIMIT);
    const [formatType, ...payload] = bech32.fromWords(words);
    if (
      [
        AddressFormat.FullData,
        AddressFormat.FullType,
        AddressFormat.Short,
      ].includes(formatType)
    ) {
      return { prefix, format: formatType, payload };
    }
  }

  throw Error(`Unknown address format ${address}`);
}

export function decodeAddressInfo(
  format: AddressFormat,
  payload: number[],
  client: Client,
) {
  if (format === AddressFormat.Full) {
    if (payload.length < 32 + 1) {
      throw new Error(`Invalid full address without enough payload ${toHex(payload)}`);
    }

    return new AddressPlain(decodeScript(payload), client);
  }

  if (format === AddressFormat.FullData) {
    if (payload.length < 32) {
      throw new Error(`Invalid full data address without enough payload ${toHex(payload)}`);
    }

    return new AddressPlain(
      {
        codeHash: toHex(payload.slice(0, 32)),
        hashType: "data",
        args: toHex(payload.slice(32)),
      },
      client,
    );
  }

  if (format === AddressFormat.FullType) {
    if (payload.length < 32) {
      throw new Error(`Invalid full type address without enough payload ${toHex(payload)}`);
    }

    return new AddressPlain(
      {
        codeHash: toHex(payload.slice(0, 32)),
        hashType: "type",
        args: toHex(payload.slice(32)),
      },
      client,
    );
  }

  // format === AddressFormat.Short
  if (payload.length !== 21) {
    throw new Error(`Invalid short address without enough payload ${toHex(payload)}`);
  }
  const script = [
    KnownScript.Secp256k1Blake160,
    KnownScript.Secp256k1Multisig,
    KnownScript.AnyoneCanPay,
  ][payload[0]];
  if (script === undefined) {
    throw new Error(
      `Invalid short address with unknown script ${toHex(payload)}`,
    );
  }

  return new AddressKnownScript(script, toHex(payload.slice(1)), client);
}

export function getClientFromAddressPrefix(prefix: string): Client | undefined {
  if (prefix === "ckb") {
    return new ClientPublicMainnet();
  }

  if (prefix === "ckt") {
    return new ClientPublicTestnet();
  }
}