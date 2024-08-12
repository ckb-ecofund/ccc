import { LockScriptInfo } from "@ckb-lumos/common-scripts";

import { ccc } from "@ckb-ccc/core";
import { cccA } from "@ckb-ccc/core/advanced";
import {
  Cell,
  CellCollector,
  CellProvider,
  QueryOptions,
  Script,
} from "@ckb-lumos/base";
import { bytes } from "@ckb-lumos/codec";
import { FromInfo, parseFromInfo } from "@ckb-lumos/common-scripts";
import { addCellDep } from "@ckb-lumos/common-scripts/lib/helper";
import { Config, getConfig } from "@ckb-lumos/config-manager";
import { asserts } from "./utils.js";

/**
 * Generates a class for collecting custom script cells.
 * @param {string} codeHash - The code hash of the custom script.
 * @returns {typeof JoyIDCellCollector} The CustomCellCollector class.
 */
function generateCollectorClass(codeHash: string) {
  /**
   * Class representing a collector for custom script cells.
   * @class
   */
  return class CustomCellCollector {
    readonly fromScript: Script;
    readonly cellCollector: CellCollector | undefined;

    /**
     * Creates an instance of CustomCollector.
     * @param {FromInfo} fromInfo - The information about the address to collect cells from.
     * @param {CellProvider} cellProvider - The provider to collect cells from.
     * @param {Object} options - The options for the collector.
     * @param {QueryOptions} [options.queryOptions={}] - The query options for collecting cells.
     * @param {Config} [options.config=getConfig()] - The Lumos configuration.
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
 * @param {string} codeHash - The code hash of the custom script.
 * @param {CellDep[]} cellDeps - The cell dependencies for the custom script.
 * @returns {LockScriptInfo} The lock script information.
 */
export function generateScriptInfo(
  codeHash: string,
  cellDeps: ccc.CellDepInfoLike[],
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

        return txSkeleton;
      },
    },
  };
}

const NOSTR_TESTNET_TYPE_HASH =
  "0x6ae5ee0cb887b2df5a9a18137315b9bdc55be8d52637b2de0624092d5f0c91d5";
const NOSTR_TESTNET_TYPE: Script = {
  codeHash:
    "0x00000000000000000000000000000000000000000000000000545950455f4944",
  hashType: "type",
  args: "0x8dc56c6f35f0c535e23ded1629b1f20535477a1b43e59f14617d11e32c50e0aa",
};

/**
 * Generates default script information for CCC.
 * @returns {LockScriptInfo[]} An array of lock script information.
 */
export function generateDefaultScriptInfos(): LockScriptInfo[] {
  const mainnet = cccA.MAINNET_SCRIPTS;
  const testnet = cccA.TESTNET_SCRIPTS;

  return [
    ccc.KnownScript.JoyId,
    ccc.KnownScript.NostrLock,
    ccc.KnownScript.PWLock,
  ]
    .map((script) => [
      generateScriptInfo(testnet[script]!.codeHash, testnet[script]!.cellDeps),
      generateScriptInfo(mainnet[script]!.codeHash, mainnet[script]!.cellDeps),
    ])
    .flat();
}
