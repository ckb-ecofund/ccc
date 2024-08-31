/**
 * Represents a fixed point value as a bigint.
 * @public
 */

export type FixedPoint = bigint;

/**
 * Represents a value that can be converted to a fixed point value.
 * It can be a bigint, string, or number.
 * @public
 */

export type FixedPointLike = bigint | string | number;

/**
 * Converts a FixedPointLike value to its string representation with fixed-point decimals.
 * @public
 *
 * @param val - The value to convert, which can be a bigint, string, or number.
 * @param decimals - The number of decimal places for the fixed-point representation. Default is 8.
 * @returns A string representing the fixed-point value.
 *
 * @example
 * ```typescript
 * const str = fixedPointToString(123456789n, 8); // Outputs "1.23456789"
 * const strFromString = fixedPointToString("1.23456789", 8); // Outputs "1.23456789"
 * const strFromNumber = fixedPointToString(1.23456789, 8); // Outputs "1.23456789"
 * ```
 */

export function fixedPointToString(val: FixedPointLike, decimals = 8): string {
  const str = fixedPointFrom(val).toString();
  if (decimals === 0) {
    return str;
  }

  const l = str.length <= decimals ? "0" : str.slice(0, -decimals);
  const r = str.slice(-decimals).padStart(decimals, "0").replace(/0*$/, "");
  if (r === "") {
    return l;
  }

  return `${l}.${r}`;
}

/**
 * Converts a FixedPointLike value to a FixedPoint (bigint) with fixed-point decimals.
 * @public
 *
 * @param val - The value to convert, which can be a bigint, string, or number.
 * @param decimals - The number of decimal places for the fixed-point representation. Default is 8.
 * @returns A FixedPoint (bigint) representing the value with fixed-point decimals.
 *
 * @example
 * ```typescript
 * const fixedPoint = fixedPointFrom(123456789n, 8); // Outputs 123456789n
 * const fixedPointFromString = fixedPointFrom("1.23456789", 8); // Outputs 123456789n
 * const fixedPointFromNumber = fixedPointFrom(1.23456789, 8); // Outputs 123456789n
 * ```
 */

export function fixedPointFrom(val: FixedPointLike, decimals = 8): FixedPoint {
  if (typeof val === "bigint") {
    return val;
  }

  const [l, r] = (
    typeof val === "number" ? val.toFixed(decimals) : val.toString()
  ).split(".");
  const lVal = BigInt(l.padEnd(l.length + decimals, "0"));
  if (r === undefined) {
    return lVal;
  }

  return lVal + BigInt(r.slice(0, decimals).padEnd(decimals, "0"));
}

/**
 * Represents the fixed point value of zero as a bigint.
 * @public
 */

export const Zero: FixedPoint = 0n;

/**
 * Represents the fixed point value of one as a FixedPoint (bigint).
 * Equivalent to 1 in fixed-point representation with default decimals (8).
 * @public
 */

export const One: FixedPoint = fixedPointFrom("1");
