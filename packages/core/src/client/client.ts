import { ScriptLike, TransactionLike } from "../ckb";
import { Hex } from "../hex";
import { OutputsValidator } from "./clientTypes";

export enum KnownScript {
  Secp256k1Blake160,
  Secp256k1Multisig,
  AnyoneCanPay,
  JoyId,
  OmniLock,
}

export interface Client {
  getUrl(): string;

  getAddressPrefix(): Promise<string>;
  getKnownScript(script: KnownScript): Promise<Omit<ScriptLike, "args">>;

  sendTransaction(
    transaction: TransactionLike,
    validator?: OutputsValidator,
  ): Promise<Hex>;
}
