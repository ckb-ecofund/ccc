import { Script } from "../types";

export enum KnownScript {
  Secp256k1Blake160,
  Secp256k1Multisig,
  AnyoneCanPay,
  JoyId,
  OmniLock,
}

export abstract class Client {
  abstract getAddressPrefix(): Promise<string>;
  abstract getKnownScript(script: KnownScript): Promise<Omit<Script, "args">>;
}
