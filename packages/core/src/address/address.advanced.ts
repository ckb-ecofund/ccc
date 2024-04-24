import { Client, KnownScript } from "../client";
import { toHex } from "../bytes";
import { AddressFormat } from "./advanced";
import { type Address as AddressType } from "./index";
import { decodeHashType } from "../ckb";

export async function fromAddressPayload(
  prefix: string,
  format: AddressFormat,
  payload: number[],
  client: Client,
): Promise<AddressType> {
  if (format === AddressFormat.Full) {
    if (payload.length < 32 + 1) {
      throw new Error(
        `Invalid full address without enough payload ${toHex(payload)}`,
      );
    }

    return {
      script: {
        codeHash: toHex(payload.slice(0, 32)),
        hashType: decodeHashType(payload.slice(32, 33)),
        args: toHex(payload.slice(33)),
      },
      prefix,
    };
  }

  if (format === AddressFormat.FullData) {
    if (payload.length < 32) {
      throw new Error(
        `Invalid full data address without enough payload ${toHex(payload)}`,
      );
    }

    return {
      script: {
        codeHash: toHex(payload.slice(0, 32)),
        hashType: "data",
        args: toHex(payload.slice(32)),
      },
      prefix,
    };
  }

  if (format === AddressFormat.FullType) {
    if (payload.length < 32) {
      throw new Error(
        `Invalid full type address without enough payload ${toHex(payload)}`,
      );
    }

    return {
      script: {
        codeHash: toHex(payload.slice(0, 32)),
        hashType: "type",
        args: toHex(payload.slice(32)),
      },
      prefix,
    };
  }

  // format === AddressFormat.Short
  if (payload.length !== 21) {
    throw new Error(
      `Invalid short address without enough payload ${toHex(payload)}`,
    );
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

  return {
    script: {
      ...(await client.getKnownScript(script)),
      args: toHex(payload.slice(1)),
    },
    prefix,
  };
}
