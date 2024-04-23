import { encodeScript } from "../codec";
import { Script } from "../types";
import { Address } from "./address";
import { bech32m } from "bech32";
import { AddressFormat, BECH32_LIMIT } from "./constants.advanced";

export function encodeScriptToAddressString(prefix: string, script: Script) {
  const data = [AddressFormat.Full, ...encodeScript(script)];

  return bech32m.encode(prefix, bech32m.toWords(data), BECH32_LIMIT);
}

export abstract class BaseAddress extends Address {
  async getAddress(): Promise<string> {
    const prefix = await (await this.getClient()).getAddressPrefix();

    return encodeScriptToAddressString(prefix, await this.getScript());
  }
}