import {
  Cell,
  CellLike,
  OutPoint,
  OutPointLike,
  Transaction,
  TransactionLike,
} from "../../ckb/index.js";
import { HexLike, hexFrom } from "../../hex/index.js";
import { ClientCollectableSearchKeyLike } from "../clientTypes.advanced.js";
import { ClientCache } from "./cache.js";
import { filterCell } from "./memory.advanced.js";

export class ClientCacheMemory implements ClientCache {
  private readonly cachedTransactions: Transaction[] = [];
  private readonly unusableOutPoints: OutPoint[] = [];
  private readonly usableCells: Cell[] = [];
  private readonly knownCells: Cell[] = [];

  async markUsable(cellLike: CellLike): Promise<void> {
    const cell = Cell.from(cellLike).clone();
    this.usableCells.push(cell);
    this.knownCells.push(cell);

    const index = this.unusableOutPoints.findIndex((o) => cell.outPoint.eq(o));
    if (index !== -1) {
      this.unusableOutPoints.splice(index, 1);
    }
  }

  async markUnusable(outPointLike: OutPointLike): Promise<void> {
    const outPoint = OutPoint.from(outPointLike);
    this.unusableOutPoints.push(outPoint.clone());

    const index = this.usableCells.findIndex((c) => c.outPoint.eq(outPoint));
    if (index !== -1) {
      this.usableCells.splice(index, 1);
    }
  }

  async isUnusable(outPointLike: OutPointLike): Promise<boolean> {
    const outPoint = OutPoint.from(outPointLike);
    return this.unusableOutPoints.find((o) => o.eq(outPoint)) !== undefined;
  }

  async recordTransactions(
    ...transactions: (TransactionLike | TransactionLike[])[]
  ): Promise<void> {
    this.cachedTransactions.push(...transactions.flat().map(Transaction.from));
  }
  async getTransaction(txHashLike: HexLike): Promise<Transaction | undefined> {
    const txHash = hexFrom(txHashLike);
    return this.cachedTransactions.find((tx) => tx.hash() === txHash);
  }

  async recordCells(...cells: (CellLike | CellLike[])[]): Promise<void> {
    this.usableCells.push(...cells.flat().map(Cell.from));
  }
  async getCell(outPointLike: OutPointLike): Promise<Cell | undefined> {
    const outPoint = OutPoint.from(outPointLike);
    return this.usableCells.find((cell) => cell.outPoint.eq(outPoint));
  }

  async *findCells(
    keyLike: ClientCollectableSearchKeyLike,
  ): AsyncGenerator<Cell> {
    for (const cell of this.usableCells) {
      if (!filterCell(keyLike, cell)) {
        continue;
      }

      yield cell;
    }
  }
}
