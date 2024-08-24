import {
  Cell,
  CellDep,
  CellDepLike,
  CellLike,
  OutPoint,
  OutPointLike,
  Script,
  ScriptLike,
  Transaction,
  TransactionLike,
} from "../ckb/index.js";
import { Zero } from "../fixedPoint/index.js";
import { Hex, HexLike, hexFrom } from "../hex/index.js";
import { Num, NumLike, numFrom } from "../num/index.js";
import { apply, reduceAsync } from "../utils/index.js";
import { filterCell } from "./client.advanced.js";
import { ClientCollectableSearchKeyLike } from "./clientTypes.advanced.js";
import {
  ClientBlock,
  ClientFindCellsResponse,
  ClientFindTransactionsGroupedResponse,
  ClientFindTransactionsResponse,
  ClientIndexerSearchKey,
  ClientIndexerSearchKeyLike,
  ClientIndexerSearchKeyTransactionLike,
  ClientTransactionResponse,
  OutputsValidator,
} from "./clientTypes.js";

/**
 * @public
 */
export enum KnownScript {
  Secp256k1Blake160 = "Secp256k1Blake160",
  Secp256k1Multisig = "Secp256k1Multisig",
  AnyoneCanPay = "AnyoneCanPay",
  TypeId = "TypeId",
  XUdt = "XUdt",
  JoyId = "JoyId",
  COTA = "COTA",
  PWLock = "PWLock",
  OmniLock = "OmniLock",
  NostrLock = "NostrLock",
  UniqueType = "UniqueType",
  SingleUseLock = "SingleUseLock",
  OutputTypeProxyLock = "OutputTypeProxyLock",
}

/**
 * @public
 */
export type CellDepInfoLike = {
  cellDep: CellDepLike;
  type?: ScriptLike | null;
};

/**
 * @public
 */
export class CellDepInfo {
  constructor(
    public cellDep: CellDep,
    public type?: Script,
  ) {}

  static from(cellDepInfoLike: CellDepInfoLike): CellDepInfo {
    return new CellDepInfo(
      CellDep.from(cellDepInfoLike.cellDep),
      apply(Script.from, cellDepInfoLike.type),
    );
  }
}

/**
 * @public
 */
export abstract class Client {
  private readonly cachedTransactions: Transaction[] = [];
  private readonly unusableOutPoints: OutPoint[] = [];
  private readonly usableCells: Cell[] = [];
  private readonly knownCells: Cell[] = [];

  abstract get url(): string;
  abstract get addressPrefix(): string;

  abstract getKnownScript(
    script: KnownScript,
  ): Promise<
    Pick<Script, "codeHash" | "hashType"> & { cellDeps: CellDepInfo[] }
  >;

  abstract getTip(): Promise<Num>;
  abstract getBlockByNumber(
    blockNumber: NumLike,
    verbosity?: number | null,
    withCycles?: boolean | null,
  ): Promise<ClientBlock | undefined>;
  abstract getBlockByHash(
    blockHash: HexLike,
    verbosity?: number | null,
    withCycles?: boolean | null,
  ): Promise<ClientBlock | undefined>;

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

  abstract sendTransactionNoCache(
    transaction: TransactionLike,
    validator?: OutputsValidator,
  ): Promise<Hex>;
  abstract getTransactionNoCache(
    txHash: HexLike,
  ): Promise<ClientTransactionResponse | undefined>;

  async getCell(outPointLike: OutPointLike): Promise<Cell | undefined> {
    const outPoint = OutPoint.from(outPointLike);
    const cached = this.knownCells.find((cell) => cell.outPoint.eq(outPoint));

    if (cached) {
      return cached.clone();
    }

    const transaction = await this.getTransactionNoCache(outPoint.txHash);
    if (!transaction) {
      return;
    }

    const index = Number(numFrom(outPoint.index));
    if (index >= transaction.transaction.outputs.length) {
      return;
    }

    const cell = Cell.from({
      outPoint,
      cellOutput: transaction.transaction.outputs[index],
      outputData: transaction.transaction.outputsData[index] ?? "0x",
    });
    this.knownCells.push(cell);
    return cell.clone();
  }

  abstract findCellsPagedNoCache(
    key: ClientIndexerSearchKeyLike,
    order?: "asc" | "desc",
    limit?: NumLike,
    after?: string,
  ): Promise<ClientFindCellsResponse>;
  async findCellsPaged(
    key: ClientIndexerSearchKeyLike,
    order?: "asc" | "desc",
    limit?: NumLike,
    after?: string,
  ): Promise<ClientFindCellsResponse> {
    const res = await this.findCellsPagedNoCache(key, order, limit, after);
    this.knownCells.push(...res.cells);
    return res;
  }

  async *findCells(
    key: ClientIndexerSearchKeyLike,
    order?: "asc" | "desc",
    limit = 10,
  ): AsyncGenerator<Cell> {
    let last: string | undefined = undefined;

    while (true) {
      const { cells, lastCursor } = await this.findCellsPaged(
        key,
        order,
        limit,
        last,
      );
      for (const cell of cells) {
        yield cell;
      }
      if (cells.length === 0 || cells.length < limit) {
        return;
      }
      last = lastCursor;
    }
  }

  /**
   * Find cells by search key designed for collectable cells.
   *
   * @param keyLike - The search key.
   * @returns A async generator for yielding cells.
   */
  async *findCellsByCollectableSearchKey(
    keyLike: ClientCollectableSearchKeyLike,
    order?: "asc" | "desc",
    limit = 10,
  ): AsyncGenerator<Cell> {
    const key = ClientIndexerSearchKey.from(keyLike);
    const foundedOutPoints = [];

    for (const cell of this.usableCells) {
      if (!filterCell(key, cell)) {
        continue;
      }

      foundedOutPoints.push(cell.outPoint);
      yield cell;
    }

    for await (const cell of this.findCells(key, order, limit)) {
      if (
        this.unusableOutPoints.some((o) => o.eq(cell.outPoint)) ||
        foundedOutPoints.some((founded) => founded.eq(cell.outPoint))
      ) {
        continue;
      }

      yield cell;
    }
  }

  findCellsByLock(
    lock: ScriptLike,
    type?: ScriptLike | null,
    withData = true,
    order?: "asc" | "desc",
    limit = 10,
  ): AsyncGenerator<Cell> {
    return this.findCellsByCollectableSearchKey(
      {
        script: lock,
        scriptType: "lock",
        scriptSearchMode: "exact",
        filter: {
          script: type,
        },
        withData,
      },
      order,
      limit,
    );
  }

  findCellsByType(
    type: ScriptLike,
    withData = true,
    order?: "asc" | "desc",
    limit = 10,
  ): AsyncGenerator<Cell> {
    return this.findCellsByCollectableSearchKey(
      {
        script: type,
        scriptType: "type",
        scriptSearchMode: "exact",
        withData,
      },
      order,
      limit,
    );
  }

  async findSingletonCellByType(
    type: ScriptLike,
    withData = false,
  ): Promise<Cell | undefined> {
    for await (const cell of this.findCellsByType(
      type,
      withData,
      undefined,
      1,
    )) {
      return cell;
    }
  }

  async getCellDeps(
    ...cellDepsInfoLike: (CellDepInfoLike | CellDepInfoLike[])[]
  ): Promise<CellDep[]> {
    return Promise.all(
      cellDepsInfoLike.flat().map(async (infoLike) => {
        const { cellDep, type } = CellDepInfo.from(infoLike);
        if (type === undefined) {
          return cellDep;
        }
        const found = await this.findSingletonCellByType(type);
        if (!found) {
          return cellDep;
        }

        return CellDep.from({
          outPoint: found.outPoint,
          depType: cellDep.depType,
        });
      }),
    );
  }

  abstract findTransactionsPaged(
    key: Omit<ClientIndexerSearchKeyTransactionLike, "groupByTransaction"> & {
      groupByTransaction: true;
    },
    order?: "asc" | "desc",
    limit?: NumLike,
    after?: string,
  ): Promise<ClientFindTransactionsGroupedResponse>;
  abstract findTransactionsPaged(
    key: Omit<ClientIndexerSearchKeyTransactionLike, "groupByTransaction"> & {
      groupByTransaction?: false | null;
    },
    order?: "asc" | "desc",
    limit?: NumLike,
    after?: string,
  ): Promise<ClientFindTransactionsResponse>;
  abstract findTransactionsPaged(
    key: ClientIndexerSearchKeyTransactionLike,
    order?: "asc" | "desc",
    limit?: NumLike,
    after?: string,
  ): Promise<
    ClientFindTransactionsResponse | ClientFindTransactionsGroupedResponse
  >;

  findTransactions(
    key: Omit<ClientIndexerSearchKeyTransactionLike, "groupByTransaction"> & {
      groupByTransaction: true;
    },
    order?: "asc" | "desc",
    limit?: number,
  ): AsyncGenerator<ClientFindTransactionsGroupedResponse["transactions"][0]>;
  findTransactions(
    key: Omit<ClientIndexerSearchKeyTransactionLike, "groupByTransaction"> & {
      groupByTransaction?: false | null;
    },
    order?: "asc" | "desc",
    limit?: number,
  ): AsyncGenerator<ClientFindTransactionsResponse["transactions"][0]>;
  findTransactions(
    key: ClientIndexerSearchKeyTransactionLike,
    order?: "asc" | "desc",
    limit?: number,
  ): AsyncGenerator<
    | ClientFindTransactionsResponse["transactions"][0]
    | ClientFindTransactionsGroupedResponse["transactions"][0]
  >;
  async *findTransactions(
    key: ClientIndexerSearchKeyTransactionLike,
    order?: "asc" | "desc",
    limit = 10,
  ): AsyncGenerator<
    | ClientFindTransactionsResponse["transactions"][0]
    | ClientFindTransactionsGroupedResponse["transactions"][0]
  > {
    let last: string | undefined = undefined;

    while (true) {
      const {
        transactions,
        lastCursor,
      }:
        | ClientFindTransactionsResponse
        | ClientFindTransactionsGroupedResponse =
        await this.findTransactionsPaged(key, order, limit, last);
      for (const tx of transactions) {
        yield tx;
      }
      if (transactions.length === 0 || transactions.length < limit) {
        return;
      }
      last = lastCursor;
    }
  }

  findTransactionsByLock(
    lock: ScriptLike,
    type: ScriptLike | undefined | null,
    groupByTransaction: true,
    order?: "asc" | "desc",
    limit?: number,
  ): AsyncGenerator<ClientFindTransactionsGroupedResponse["transactions"][0]>;
  findTransactionsByLock(
    lock: ScriptLike,
    type?: ScriptLike | null,
    groupByTransaction?: false | null,
    order?: "asc" | "desc",
    limit?: number,
  ): AsyncGenerator<ClientFindTransactionsResponse["transactions"][0]>;
  findTransactionsByLock(
    lock: ScriptLike,
    type?: ScriptLike | null,
    groupByTransaction?: boolean | null,
    order?: "asc" | "desc",
    limit?: number,
  ): AsyncGenerator<
    | ClientFindTransactionsResponse["transactions"][0]
    | ClientFindTransactionsGroupedResponse["transactions"][0]
  >;
  findTransactionsByLock(
    lock: ScriptLike,
    type?: ScriptLike | null,
    groupByTransaction?: boolean | null,
    order?: "asc" | "desc",
    limit = 10,
  ): AsyncGenerator<
    | ClientFindTransactionsResponse["transactions"][0]
    | ClientFindTransactionsGroupedResponse["transactions"][0]
  > {
    return this.findTransactions(
      {
        script: lock,
        scriptType: "lock",
        scriptSearchMode: "exact",
        filter: {
          script: type,
        },
        groupByTransaction,
      },
      order,
      limit,
    );
  }

  findTransactionsByType(
    type: ScriptLike,
    groupByTransaction: true,
    order?: "asc" | "desc",
    limit?: number,
  ): AsyncGenerator<ClientFindTransactionsGroupedResponse["transactions"][0]>;
  findTransactionsByType(
    type: ScriptLike,
    groupByTransaction?: false | null,
    order?: "asc" | "desc",
    limit?: number,
  ): AsyncGenerator<ClientFindTransactionsResponse["transactions"][0]>;
  findTransactionsByType(
    type: ScriptLike,
    groupByTransaction?: boolean | null,
    order?: "asc" | "desc",
    limit?: number,
  ): AsyncGenerator<
    | ClientFindTransactionsResponse["transactions"][0]
    | ClientFindTransactionsGroupedResponse["transactions"][0]
  >;
  findTransactionsByType(
    type: ScriptLike,
    groupByTransaction?: boolean | null,
    order?: "asc" | "desc",
    limit = 10,
  ): AsyncGenerator<
    | ClientFindTransactionsResponse["transactions"][0]
    | ClientFindTransactionsGroupedResponse["transactions"][0]
  > {
    return this.findTransactions(
      {
        script: type,
        scriptType: "type",
        scriptSearchMode: "exact",
        groupByTransaction,
      },
      order,
      limit,
    );
  }

  abstract getCellsCapacity(key: ClientIndexerSearchKeyLike): Promise<Num>;

  async getBalanceSingle(lock: ScriptLike): Promise<Num> {
    return this.getCellsCapacity({
      script: lock,
      scriptType: "lock",
      scriptSearchMode: "exact",
      filter: {
        scriptLenRange: [0, 1],
        outputDataLenRange: [0, 1],
      },
    });
  }

  async getBalance(locks: ScriptLike[]): Promise<Num> {
    return reduceAsync(
      locks,
      async (acc, lock) => acc + (await this.getBalanceSingle(lock)),
      Zero,
    );
  }

  async sendTransaction(
    transaction: TransactionLike,
    validator?: OutputsValidator,
  ): Promise<Hex> {
    const tx = Transaction.from(transaction);

    const txHash = await this.sendTransactionNoCache(tx, validator);

    this.cachedTransactions.push(tx.clone());
    await Promise.all(
      tx.inputs.map((i) => this.markUnusable(i.previousOutput)),
    );
    await Promise.all(
      tx.outputs.map((o, i) =>
        this.markUsable({
          cellOutput: o,
          outputData: tx.outputsData[i],
          outPoint: {
            txHash,
            index: i,
          },
        }),
      ),
    );
    return txHash;
  }

  async getTransaction(
    txHashLike: HexLike,
  ): Promise<ClientTransactionResponse | undefined> {
    const txHash = hexFrom(txHashLike);
    const res = await this.getTransactionNoCache(txHash);
    if (res !== null) {
      return res;
    }

    const tx = this.cachedTransactions.find((t) => t.hash() === txHash);
    if (!tx) {
      return;
    }

    return {
      transaction: tx,
      status: "proposed",
    };
  }
}
