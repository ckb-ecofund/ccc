import { Hasher, Script, Transaction } from "../ckb";
import { Hex } from "../primitive";

export async function getSignHashInfo(
  tx: Transaction,
  script: Script,
): Promise<{ message: Hex; position: number } | undefined> {
  let position = -1;
  const hasher = new Hasher();
  hasher.update(Transaction.hashRaw(tx));

  tx.witnesses.forEach((witness, i) => {
    const input = tx.inputs[i];
    if (input) {
      if (!input.cellOutput?.lock) {
        throw Error("Incomplete inputs info");
      }

      if (!Script.eq(input.cellOutput?.lock, script)) {
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
