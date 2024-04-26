export function apply<T, R>(
  transformer: (val: T) => R,
  value: undefined,
): undefined;
export function apply<T, R>(transformer: (val: T) => R, value: null): null;
export function apply<T, R>(transformer: (val: T) => R, value: T): R;
export function apply<T, R>(
  transformer: (val: T) => R,
  value: T | undefined,
): R | undefined;
export function apply<T, R>(
  transformer: (val: T) => R,
  value: T | null,
): R | null;
export function apply<T, R>(
  transformer: (val: T) => R,
  value: undefined | null,
): undefined | null;
export function apply<T, R>(
  transformer: (val: T) => R,
  value: T | undefined | null,
): R | undefined | null {
  if (value == null) {
    return value as undefined | null;
  }

  return transformer(value);
}
