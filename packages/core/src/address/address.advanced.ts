import { bech32, bech32m } from "bech32";
import { hashTypeFromBytes } from "../ckb";
import { Client, KnownScript } from "../client";
import { hexFrom } from "../hex";
import { type AddressLike } from "./index";

export function addressPayloadFromString(address: string): {
  prefix: string;
  format: AddressFormat;
  payload: number[];
} {
  // Try parse full format address
  {
    const { words, prefix } = bech32m.decode(address, ADDRESS_BECH32_LIMIT);
    const [formatType, ...payload] = bech32m.fromWords(words);

    if (formatType === (AddressFormat.Full as number)) {
      return { prefix, format: AddressFormat.Full, payload };
    }
  }

  // Try parse legacy 2019 format address
  {
    const { prefix, words } = bech32.decode(address, ADDRESS_BECH32_LIMIT);
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

export async function addressFromPayload(
  prefix: string,
  format: AddressFormat,
  payload: number[],
  client: Client,
): Promise<AddressLike> {
  if (format === AddressFormat.Full) {
    if (payload.length < 32 + 1) {
      throw new Error(
        `Invalid full address without enough payload ${hexFrom(payload)}`,
      );
    }

    return {
      script: {
        codeHash: hexFrom(payload.slice(0, 32)),
        hashType: hashTypeFromBytes(payload.slice(32, 33)),
        args: hexFrom(payload.slice(33)),
      },
      prefix,
    };
  }

  if (format === AddressFormat.FullData) {
    if (payload.length < 32) {
      throw new Error(
        `Invalid full data address without enough payload ${hexFrom(payload)}`,
      );
    }

    return {
      script: {
        codeHash: hexFrom(payload.slice(0, 32)),
        hashType: "data",
        args: hexFrom(payload.slice(32)),
      },
      prefix,
    };
  }

  if (format === AddressFormat.FullType) {
    if (payload.length < 32) {
      throw new Error(
        `Invalid full type address without enough payload ${hexFrom(payload)}`,
      );
    }

    return {
      script: {
        codeHash: hexFrom(payload.slice(0, 32)),
        hashType: "type",
        args: hexFrom(payload.slice(32)),
      },
      prefix,
    };
  }

  // format === AddressFormat.Short
  if (payload.length !== 21) {
    throw new Error(
      `Invalid short address without enough payload ${hexFrom(payload)}`,
    );
  }
  const script = [
    KnownScript.Secp256k1Blake160,
    KnownScript.Secp256k1Multisig,
    KnownScript.AnyoneCanPay,
  ][payload[0]];
  if (script === undefined) {
    throw new Error(
      `Invalid short address with unknown script ${hexFrom(payload)}`,
    );
  }

  return {
    script: {
      ...(await client.getKnownScript(script)),
      args: hexFrom(payload.slice(1)),
    },
    prefix,
  };
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

export const ADDRESS_BECH32_LIMIT = 1023;
