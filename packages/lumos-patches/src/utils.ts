/**
 * Asserts that a condition is true, throwing an error if it is not.
 * @param {unknown} condition - The condition to assert.
 * @param {string} [message="Assert failed"] - The error message to throw if the condition is false.
 * @throws {Error} If the condition is false.
 */
export function asserts(
  condition: unknown,
  message = "Assert failed",
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
