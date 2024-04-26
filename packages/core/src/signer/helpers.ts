import { Script, ScriptLike, Transaction, TransactionLike } from "../ckb";
import { Hasher } from "../hasher";
import { Hex } from "../hex";

export async function getSignHashInfo(
  txLike: TransactionLike,
  scriptLike: ScriptLike,
): Promise<{ message: Hex; position: number } | undefined> {
  const tx = Transaction.from(txLike);
  const script = Script.from(scriptLike);
  let position = -1;
  const hasher = new Hasher();
  hasher.update(tx.hash());

  tx.witnesses.forEach((witness, i) => {
    const input = tx.inputs[i];
    if (input) {
      if (!input.cellOutput?.lock) {
        throw Error("Incomplete inputs info");
      }

      if (!script.eq(input.cellOutput?.lock)) {
        return;
      }

      if (position === -1) {
        position = i;
      }
    }

    if (position === -1) {
      return undefined;
    }

    Transaction.hashWitnessToHasher(witness, hasher);
  });

  if (position === -1) {
    return undefined;
  }

  return {
    message: hasher.digest(),
    position,
  };
}
