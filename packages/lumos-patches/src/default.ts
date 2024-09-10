import { ccc } from "@ckb-ccc/core";
import { cccA } from "@ckb-ccc/core/advanced";
import {
  Cell,
  CellCollector,
  CellDep,
  CellProvider,
  QueryOptions,
  Script,
} from "@ckb-lumos/base";
import { bytes } from "@ckb-lumos/codec";
import {
  FromInfo,
  LockScriptInfo,
  parseFromInfo,
} from "@ckb-lumos/common-scripts";
import { Config, getConfig } from "@ckb-lumos/config-manager";
import { TransactionSkeletonType } from "@ckb-lumos/helpers";
import { asserts } from "./utils.js";

function addCellDep(
  txSkeleton: TransactionSkeletonType,
  newCellDep: CellDep,
): TransactionSkeletonType {
  const cellDep = txSkeleton.get("cellDeps").find((cellDep) => {
    return (
      cellDep.depType === newCellDep.depType &&
      ccc.OutPoint.from(cellDep.outPoint).eq(
        ccc.OutPoint.from(newCellDep.outPoint),
      )
    );
  });

  if (!cellDep) {
    txSkeleton = txSkeleton.update("cellDeps", (cellDeps) => {
      return cellDeps.push({
        outPoint: newCellDep.outPoint,
        depType: newCellDep.depType,
      });
    });
  }

  return txSkeleton;
}

/**
 * Generates a class for collecting custom script cells.
 * @param codeHash - The code hash of the custom script.
 * @returns The CustomCellCollector class.
 */
function generateCollectorClass(codeHash: string) {
  /**
   * Class representing a collector for custom script cells.
   */
  return class CustomCellCollector {
    readonly fromScript: Script;
    readonly cellCollector: CellCollector | undefined;

    /**
     * Creates an instance of CustomCollector.
     * @param fromInfo - The information about the address to collect cells from.
     * @param cellProvider - The provider to collect cells from.
     * @param options - The options for the collector.
     * @param] - The query options for collecting cells.
     * @param [options.config=getConfig()] - The Lumos configuration.
     * @throws {Error} If cellProvider is not provided or fromInfo is not a string.
     */
    constructor(
      fromInfo: FromInfo,
      cellProvider: CellProvider,
      {
        queryOptions = {},
        config = getConfig(),
      }: { queryOptions?: QueryOptions; config?: Config },
    ) {
      if (!cellProvider) {
        throw new Error(`cellProvider is required when collecting cells`);
      }

      const { fromScript } = parseFromInfo(fromInfo, { config });
      this.fromScript = fromScript;

      if (!bytes.equal(fromScript.codeHash, codeHash)) {
        this.cellCollector = undefined;
        return;
      }

      queryOptions = {
        ...queryOptions,
        lock: this.fromScript,
        type: queryOptions.type || "empty",
        data: queryOptions.data || "0x",
      };

      this.cellCollector = cellProvider.collector(queryOptions);
    }

    /**
     * Collects custom cells.
     * @async
     * @generator
     * @yields {Cell} The collected cell.
     */
    async *collect(): AsyncGenerator<Cell> {
      if (!this.cellCollector) {
        return;
      }

      for await (const inputCell of this.cellCollector.collect()) {
        yield inputCell;
      }
    }
  };
}

/**
 * Generates custom lock script information.
 * @public
 *
 * @param codeHash - The code hash of the custom script.
 * @param cellDeps - The cell dependencies for the custom script.
 * @returns The lock script information.
 */
export function generateScriptInfo(
  codeHash: string,
  cellDeps: ccc.CellDepInfoLike[],
  dummyLockLength: number,
): LockScriptInfo {
  return {
    codeHash: codeHash,
    hashType: "type",
    lockScriptInfo: {
      CellCollector: generateCollectorClass(codeHash),
      prepareSigningEntries: () => {
        throw new Error(
          "Custom scripts doesn't support prepareSigningEntries.",
        );
      },
      async setupInputCell(txSkeleton, inputCell, _, options = {}) {
        const fromScript = inputCell.cellOutput.lock;
        asserts(
          bytes.equal(fromScript.codeHash, codeHash),
          `The input script is not specified script`,
        );
        // add inputCell to txSkeleton
        txSkeleton = txSkeleton.update("inputs", (inputs) =>
          inputs.push(inputCell),
        );

        const output: Cell = {
          cellOutput: {
            capacity: inputCell.cellOutput.capacity,
            lock: inputCell.cellOutput.lock,
            type: inputCell.cellOutput.type,
          },
          data: inputCell.data,
        };

        txSkeleton = txSkeleton.update("outputs", (outputs) =>
          outputs.push(output),
        );

        const since = options.since;
        if (since) {
          txSkeleton = txSkeleton.update("inputSinces", (inputSinces) => {
            return inputSinces.set(txSkeleton.get("inputs").size - 1, since);
          });
        }

        await Promise.all(
          cellDeps.map(async (itemLike) => {
            const item = ccc.CellDepInfo.from(itemLike);
            if (item.type && txSkeleton.cellProvider != null) {
              for await (const cell of txSkeleton
                .cellProvider!.collector({
                  type: item.type,
                })
                .collect()) {
                txSkeleton = addCellDep(txSkeleton, {
                  depType: "code",
                  outPoint: cell.outPoint!,
                });
              }
            } else {
              txSkeleton = addCellDep(txSkeleton, {
                ...item.cellDep,
                outPoint: {
                  txHash: item.cellDep.outPoint.txHash,
                  index: ccc.numToHex(item.cellDep.outPoint.index),
                },
              });
            }
          }),
        );

        const firstIndex = txSkeleton
          .get("inputs")
          .findIndex((input) =>
            ccc.Script.from(input.cellOutput.lock).eq(
              ccc.Script.from(fromScript),
            ),
          );
        txSkeleton = txSkeleton.update("witnesses", (witnesses) => {
          if (witnesses.get(firstIndex)) {
            witnesses = witnesses.merge(
              Array.from(
                new Array(firstIndex + 1 - witnesses.size),
                () => "0x",
              ),
            );
          }

          return witnesses.set(
            firstIndex,
            ccc.hexFrom(
              ccc.WitnessArgs.from({
                lock: Array.from(new Array(dummyLockLength), () => 0),
              }).toBytes(),
            ),
          );
        });

        return txSkeleton;
      },
    },
  };
}

/**
 * Generates default script information for CCC.
 * @returns An array of lock script information.
 */
export function generateDefaultScriptInfos(): LockScriptInfo[] {
  const mainnet = cccA.MAINNET_SCRIPTS;
  const testnet = cccA.TESTNET_SCRIPTS;

  return (
    [
      [ccc.KnownScript.JoyId, 1000],
      [ccc.KnownScript.NostrLock, 572],
      [ccc.KnownScript.PWLock, 65],
    ] as [ccc.KnownScript, number][]
  )
    .map(([script, dummyLockLength]) => [
      generateScriptInfo(
        ccc.hexFrom(testnet[script]!.codeHash),
        testnet[script]!.cellDeps,
        dummyLockLength,
      ),
      generateScriptInfo(
        ccc.hexFrom(mainnet[script]!.codeHash),
        mainnet[script]!.cellDeps,
        dummyLockLength,
      ),
    ])
    .flat();
}
