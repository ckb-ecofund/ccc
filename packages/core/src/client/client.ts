import { Cell, OutPointLike, Script, TransactionLike } from "../ckb";
import { Hex, HexLike } from "../hex";
import { numFrom } from "../num";
import { ClientTransactionResponse, OutputsValidator } from "./clientTypes";

export enum KnownScript {
  Secp256k1Blake160,
  Secp256k1Multisig,
  AnyoneCanPay,
  JoyId,
  OmniLock,
}

export abstract class Client {
  abstract getUrl(): string;

  abstract getAddressPrefix(): Promise<string>;
  abstract getKnownScript(
    script: KnownScript,
  ): Promise<Pick<Script, "codeHash" | "hashType">>;

  abstract sendTransaction(
    transaction: TransactionLike,
    validator?: OutputsValidator,
  ): Promise<Hex>;
  abstract getTransaction(
    txHash: HexLike,
  ): Promise<ClientTransactionResponse | null>;

  async getCell(outPoint: OutPointLike): Promise<Cell | null> {
    const transaction = await this.getTransaction(outPoint.txHash);
    if (!transaction) {
      return null;
    }

    const index = Number(numFrom(outPoint.index));
    if (index >= transaction.transaction.outputs.length) {
      return null;
    }

    return Cell.from({
      cellOutput: transaction.transaction.outputs[index],
      outputData: transaction.transaction.outputsData[index] ?? "0x",
    });
  }
}
