export function composeFixedPoint(
  val: undefined | null,
  decimals?: number,
): null;
export function composeFixedPoint(val: bigint, decimals?: number): string;
export function composeFixedPoint(
  val: bigint | undefined | null,
  decimals?: number,
): string | null;
export function composeFixedPoint(
  val: bigint | undefined | null,
  decimals = 8,
): string | null {
  if (val == null) {
    return null;
  }
  const str = val.toString();
  const l = str.length <= decimals ? "0" : str.slice(0, -decimals);
  const r = str.slice(-decimals).padStart(decimals, "0").replace(/0*$/, "");
  if (r === "") {
    return l;
  }

  return `${l}.${r}`;
}

export function parseFixedPoint(ori: undefined | null, decimals?: number): null;
export function parseFixedPoint(
  ori: string | number,
  decimals?: number,
): bigint;
export function parseFixedPoint(
  ori: string | number | undefined | null,
  decimals?: number,
): bigint | null;
export function parseFixedPoint(
  ori: string | number | undefined | null,
  decimals = 8,
): bigint | null {
  if (ori == null) {
    return null;
  }
  const [l, r] = ori.toString().split(".");
  const lVal = BigInt(l.padEnd(l.length + decimals, "0"));
  if (r === undefined) {
    return lVal;
  }

  return lVal + BigInt(r.slice(0, decimals).padEnd(decimals, "0"));
}

export const Zero = 0n;
export const One = parseFixedPoint("1");
