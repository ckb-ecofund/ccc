import { Hex } from "../primitive";
import { Script, Transaction } from "../ckb";
import { OutputsValidator } from "./clientTypes";

export enum KnownScript {
  Secp256k1Blake160,
  Secp256k1Multisig,
  AnyoneCanPay,
  JoyId,
  OmniLock,
}

export interface Client {
  getAddressPrefix(): Promise<string>;
  getKnownScript(script: KnownScript): Promise<Omit<Script, "args">>;

  sendTransaction(
    transaction: Transaction,
    validator?: OutputsValidator,
  ): Promise<Hex>;
}
