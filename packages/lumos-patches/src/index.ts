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
import { addCellDep } from "@ckb-lumos/common-scripts/lib/helper";
import { Config, getConfig } from "@ckb-lumos/config-manager";
import { getJoyIDCellDep, getJoyIDLockScript } from "@joyid/ckb";

/**
 * Generates a class for collecting JoyID-related cells.
 * @param {string} codeHash - The code hash of the JoyID script.
 * @returns {typeof JoyIDCellCollector} The JoyIDCellCollector class.
 */
export function generateCollectorClass(codeHash: string) {
  /**
   * Class representing a collector for JoyID-related cells.
   * @class
   */
  return class JoyIDCellCollector {
    readonly fromScript: Script;
    readonly cellCollector: CellCollector;

    /**
     * Creates an instance of JoyIDCellCollector.
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
        throw new Error(
          `cellProvider is required when collecting JoyID-related cells`,
        );
      }

      if (typeof fromInfo !== "string") {
        throw new Error(`Only the address FromInfo is supported`);
      }

      const { fromScript } = parseFromInfo(fromInfo, { config });
      this.fromScript = fromScript;

      queryOptions = {
        ...queryOptions,
        lock: this.fromScript,
        type: queryOptions.type || "empty",
        data: queryOptions.data || "0x",
      };

      this.cellCollector = cellProvider.collector(queryOptions);
    }

    /**
     * Collects JoyID-related cells.
     * @async
     * @generator
     * @yields {Cell} The collected cell.
     */
    async *collect(): AsyncGenerator<Cell> {
      if (!bytes.equal(this.fromScript.codeHash, codeHash)) {
        return;
      }

      for await (const inputCell of this.cellCollector.collect()) {
        yield inputCell;
      }
    }
  };
}

/**
 * Generates JoyID lock script information.
 * @param {string} codeHash - The code hash of the JoyID script.
 * @param {CellDep[]} cellDeps - The cell dependencies for the JoyID script.
 * @returns {LockScriptInfo} The lock script information.
 */
export function generateJoyIDInfo(
  codeHash: string,
  cellDeps: CellDep[],
): LockScriptInfo {
  return {
    codeHash: codeHash,
    hashType: "type",
    lockScriptInfo: {
      CellCollector: generateCollectorClass(codeHash),
      prepareSigningEntries: () => {
        throw new Error(
          "JoyID doesn't support prepareSigningEntries, please do not mix JoyID locks with other locks in a transaction",
        );
      },
      async setupInputCell(txSkeleton, inputCell, _, options = {}) {
        const fromScript = inputCell.cellOutput.lock;
        asserts(
          bytes.equal(fromScript.codeHash, codeHash),
          `The input script is not JoyID script`,
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

        cellDeps.forEach((item) => {
          txSkeleton = addCellDep(txSkeleton, item);
        });

        return txSkeleton;
      },
    },
  };
}

/**
 * Generates default script information for JoyID.
 * @returns {LockScriptInfo[]} An array of lock script information.
 */
export function generateDefaultScriptInfos(): LockScriptInfo[] {
  return [
    generateJoyIDInfo(getJoyIDLockScript(false).codeHash, [
      getJoyIDCellDep(false),
    ]),
    generateJoyIDInfo(getJoyIDLockScript(true).codeHash, [
      getJoyIDCellDep(true),
    ]),
  ];
}

/**
 * Asserts that a condition is true, throwing an error if it is not.
 * @param {unknown} condition - The condition to assert.
 * @param {string} [message="Assert failed"] - The error message to throw if the condition is false.
 * @throws {Error} If the condition is false.
 */
function asserts(
  condition: unknown,
  message = "Assert failed",
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
