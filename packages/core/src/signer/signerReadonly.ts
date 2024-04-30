import { Signer } from ".";
import { Transaction } from "../ckb";

export abstract class SignerReadonly extends Signer {
  signMessage(): Promise<string> {
    throw new Error("Method not implemented.");
  }

  signOnlyTransaction(): Promise<Transaction> {
    throw new Error("Method not implemented.");
  }
}
