import {
  Cell,
  CellLike,
  OutPointLike,
  Transaction,
  TransactionLike,
} from "../../ckb/index.js";
import { HexLike } from "../../hex/index.js";
import { ClientCollectableSearchKeyLike } from "../clientTypes.advanced.js";

export abstract class ClientCache {
  abstract markUsable(...cellLikes: (CellLike | CellLike[])[]): Promise<void>;
  abstract markUnusable(
    ...outPointLike: (OutPointLike | OutPointLike[])[]
  ): Promise<void>;
  async markTransactions(
    ...transactionLike: (TransactionLike | TransactionLike[])[]
  ): Promise<void> {
    await Promise.all([
      this.recordTransactions(...transactionLike),
      ...transactionLike.flat().map((transactionLike) => {
        const tx = Transaction.from(transactionLike);
        const txHash = tx.hash();

        return Promise.all([
          ...tx.inputs.map((i) => this.markUnusable(i.previousOutput)),
          ...tx.outputs.map((o, i) =>
            this.markUsable({
              cellOutput: o,
              outputData: tx.outputsData[i],
              outPoint: {
                txHash,
                index: i,
              },
            }),
          ),
        ]);
      }),
    ]);
  }
  abstract clear(): Promise<void>;
  abstract findCells(
    filter: ClientCollectableSearchKeyLike,
  ): AsyncGenerator<Cell>;
  /**
   * Get a known cell by out point
   * @param _outPoint
   */
  abstract getCell(_outPoint: OutPointLike): Promise<Cell | undefined>;
  abstract isUnusable(outPointLike: OutPointLike): Promise<boolean>;

  /**
   * Record known transactions
   * Implement this method to enable transactions query caching
   * @param _transactions
   */
  async recordTransactions(
    ..._transactions: (TransactionLike | TransactionLike[])[]
  ): Promise<void> {}
  /**
   * Get a known transaction by hash
   * Implement this method to enable transactions query caching
   * @param _txHash
   */
  async getTransaction(_txHash: HexLike): Promise<Transaction | undefined> {
    return;
  }

  /**
   * Record known cells
   * Implement this method to enable cells query caching
   * @param _cells
   */
  async recordCells(..._cells: (CellLike | CellLike[])[]): Promise<void> {}
}
