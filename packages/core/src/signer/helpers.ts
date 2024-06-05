import {
  Script,
  ScriptLike,
  Transaction,
  TransactionLike,
  WitnessArgs,
} from "../ckb";
import { Client } from "../client";
import { Hasher } from "../hasher";
import { Hex, hexFrom } from "../hex";

/**
 * Computes the signing hash information for a given transaction and script.
 *
 * @param txLike - The transaction to sign, represented as a TransactionLike object.
 * @param scriptLike - The script associated with the transaction, represented as a ScriptLike object.
 * @param client - The client for complete extra infos in the transaction.
 * @returns A promise that resolves to an object containing the signing message and the witness position,
 *          or undefined if no matching input is found.
 *
 * @example
 * ```typescript
 * const signHashInfo = await getSignHashInfo(transactionLike, scriptLike, client);
 * if (signHashInfo) {
 *   console.log(signHashInfo.message); // Outputs the signing message
 *   console.log(signHashInfo.position); // Outputs the witness position
 * }
 * ```
 */
export async function getSignHashInfo(
  txLike: TransactionLike,
  scriptLike: ScriptLike,
  client: Client,
): Promise<{ message: Hex; position: number } | undefined> {
  const tx = Transaction.from(txLike);
  const script = Script.from(scriptLike);
  let position = -1;
  const hasher = new Hasher();
  hasher.update(tx.hash());

  for (let i = 0; i < tx.witnesses.length; i += 1) {
    if (tx.inputs[i]) {
      const input = await tx.inputs[i].completeExtraInfos(client);

      if (!input.cellOutput) {
        throw Error("Unable to resolve inputs info");
      }

      if (!script.eq(input.cellOutput.lock)) {
        continue;
      }

      if (position === -1) {
        position = i;
      }
    }

    if (position === -1) {
      return undefined;
    }

    Transaction.hashWitnessToHasher(tx.witnesses[i], hasher);
  }

  if (position === -1) {
    return undefined;
  }

  return {
    message: hasher.digest(),
    position,
  };
}

/**
 * Prepare dummy witness for sighash all method
 *
 * @param txLike - The transaction to prepare, represented as a TransactionLike object.
 * @param scriptLike - The script associated with the transaction, represented as a ScriptLike object.
 * @param client - The client for complete extra infos in the transaction.
 * @returns A promise that resolves to the prepared transaction
 *
 * @example
 * ```typescript
 * const tx = await prepareSighashAllWitness(transactionLike, scriptLike, client);
 * ```
 */
export async function prepareSighashAllWitness(
  txLike: TransactionLike,
  scriptLike: ScriptLike,
  lockLen: number,
  client: Client,
): Promise<Transaction> {
  const tx = Transaction.from(txLike);
  const script = Script.from(scriptLike);

  let position = -1;

  for (let i = 0; i < tx.inputs.length; i += 1) {
    const input = await tx.inputs[i].completeExtraInfos(client);

    if (!input.cellOutput) {
      throw Error("Unable to resolve inputs info");
    }

    if (script.eq(input.cellOutput.lock)) {
      position = i;
      break;
    }
  }
  if (position === -1) {
    return tx;
  }

  const rawWitness = tx.witnesses[position];
  const witness =
    (rawWitness ?? "0x") !== "0x"
      ? WitnessArgs.fromBytes(rawWitness)
      : WitnessArgs.from({});
  witness.lock = hexFrom(Array.from(new Array(lockLen), () => 0));
  tx.witnesses[position] = hexFrom(witness.toBytes());

  return tx;
}
