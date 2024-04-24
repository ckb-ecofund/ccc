import { bech32, bech32m } from "bech32";
export * as Address from "./address.advanced";

export function parseAddressToPayload(address: string): {
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

export const BECH32_LIMIT = 1023;
