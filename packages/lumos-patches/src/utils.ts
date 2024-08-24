/**
 * Asserts that a condition is true, throwing an error if it is not.
 * @public
 *
 * @param condition - The condition to assert.
 * @param [message="Assert failed"] - The error message to throw if the condition is false.
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
