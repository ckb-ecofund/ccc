import { ccc } from "@ckb-ccc/connector-react";

export function tokenInfoToBytes(
  decimals: ccc.NumLike,
  symbol: string,
  name: string,
) {
  const symbolBytes = ccc.bytesFrom(symbol, "utf8");
  const nameBytes = ccc.bytesFrom(name === "" ? symbol : name, "utf8");
  return ccc.bytesConcat(
    ccc.numToBytes(decimals, 1),
    ccc.numToBytes(nameBytes.length, 1),
    nameBytes,
    ccc.numToBytes(symbolBytes.length, 1),
    symbolBytes,
  );
}

export function bytesFromAnyString(str: string): ccc.Bytes {
  try {
    return ccc.bytesFrom(str);
  } catch (e) {}

  return ccc.bytesFrom(str, "utf8");
}
