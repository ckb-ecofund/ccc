import { Script, ScriptLike, Transaction, TransactionLike } from "../ckb";
import { Client } from "../client";
import { Hasher } from "../hasher";
import { Hex } from "../hex";

/**
 * Computes the signing hash information for a given transaction and script.
 *
 * @param txLike - The transaction to sign, represented as a TransactionLike object.
 * @param scriptLike - The script associated with the transaction, represented as a ScriptLike object.
 * @returns A promise that resolves to an object containing the signing message and the witness position,
 *          or undefined if no matching input is found.
 *
 * @example
 * ```typescript
 * const signHashInfo = await getSignHashInfo(transactionLike, scriptLike);
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
        return;
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
