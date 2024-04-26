import { Signer } from ".";
import { Transaction } from "../ckb";
import { Hex } from "../hex";

export abstract class SignerReadonly extends Signer {
  signMessage(): Promise<Hex> {
    throw new Error("Method not implemented.");
  }

  signOnlyTransaction(): Promise<Transaction> {
    throw new Error("Method not implemented.");
  }
}
