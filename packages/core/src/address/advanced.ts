import { bech32, bech32m } from "bech32";
import { Script } from "../types";
import { Client } from "../client";
import { ClientPublicTestnet, ClientPublicMainnet } from "../client";
import { encodeScript } from "../codec";

export const BECH32_LIMIT = 1023;

export enum AddressFormat {
  /**
   * full version identifies the hashType
   */
  Full = 0x00,
  /**
   * @deprecated
   * short version for locks with Known codeHash, deprecated
   */
  Short = 0x01,
  /**
   * @deprecated
   * full version with hashType = "Data", deprecated
   */
  FullData = 0x02,
  /**
   * @deprecated
   * full version with hashType = "Type", deprecated
   */
  FullType = 0x04,
}

export function parseAddress(address: string): {
  prefix: string;
  format: AddressFormat;
  body: number[];
} {
  // Try parse full format address
  {
    const { words, prefix } = bech32m.decode(address, BECH32_LIMIT);
    const [formatType, ...body] = bech32m.fromWords(words);

    if (formatType === AddressFormat.Full) {
      return { prefix, format: AddressFormat.Full, body };
    }
  }

  // Try parse legacy 2019 format address
  {
    const { prefix, words } = bech32.decode(address, BECH32_LIMIT);
    const [formatType, ...body] = bech32.fromWords(words);
    if (
      [
        AddressFormat.FullData,
        AddressFormat.FullType,
        AddressFormat.Short,
      ].includes(formatType)
    ) {
      return { prefix, format: formatType, body };
    }
  }

  throw Error(`Unknown address format ${address}`);
}

export function decodeAddressInfo(format: AddressFormat, body: number[]) {}

export function getClientFromAddressPrefix(prefix: string): Client | undefined {
  if (prefix === "ckb") {
    return new ClientPublicMainnet();
  }

  if (prefix === "ckt") {
    return new ClientPublicTestnet();
  }
}
