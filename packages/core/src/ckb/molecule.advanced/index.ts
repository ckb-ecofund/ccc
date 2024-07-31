export * from "./generated.js";

export function molOptional<T>(mol: {
  hasValue: () => boolean;
  value: () => T;
}): T | undefined {
  if (mol.hasValue()) {
    return mol.value();
  }
  return;
}
