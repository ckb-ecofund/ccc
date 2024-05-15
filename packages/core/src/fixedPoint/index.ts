export type FixedPoint = bigint;
export type FixedPointLike = bigint | string | number;

export function fixedPointToString(val: FixedPointLike, decimals = 8): string {
  const str = fixedPointFrom(val).toString();
  const l = str.length <= decimals ? "0" : str.slice(0, -decimals);
  const r = str.slice(-decimals).padStart(decimals, "0").replace(/0*$/, "");
  if (r === "") {
    return l;
  }

  return `${l}.${r}`;
}

export function fixedPointFrom(val: FixedPointLike, decimals = 8): FixedPoint {
  if (typeof val === "bigint") {
    return val;
  }

  const [l, r] = val.toString().split(".");
  const lVal = BigInt(l.padEnd(l.length + decimals, "0"));
  if (r === undefined) {
    return lVal;
  }

  return lVal + BigInt(r.slice(0, decimals).padEnd(decimals, "0"));
}

export const Zero = 0n;
export const One = fixedPointFrom("1");
