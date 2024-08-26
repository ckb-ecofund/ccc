import {
  Cell,
  CellLike,
  OutPointLike,
  Transaction,
  TransactionLike,
} from "../../ckb/index.js";
import { HexLike } from "../../hex/index.js";
import { ClientCollectableSearchKeyLike } from "../clientTypes.advanced.js";

export interface ClientCache {
  markUsable(cellLike: CellLike): Promise<void>;
  markUnusable(outPointLike: OutPointLike): Promise<void>;

  isUnusable(outPointLike: OutPointLike): Promise<boolean>;

  recordTransactions(
    ...transactions: (TransactionLike | TransactionLike[])[]
  ): Promise<void>;
  getTransaction(txHash: HexLike): Promise<Transaction | undefined>;

  recordCells(...cells: (CellLike | CellLike[])[]): Promise<void>;
  getCell(outPoint: OutPointLike): Promise<Cell | undefined>;
  findCells(filter: ClientCollectableSearchKeyLike): AsyncGenerator<Cell>;
}
