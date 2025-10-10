/**
 * Type guard that checks if a value is neither undefined nor null
 * @param argument - value to check
 * @returns true if argument is defined and not null, false otherwise
 */
export function isDefinedAndNotNull<T>(
  argument: T | null | undefined,
): argument is T {
  return argument !== undefined && argument !== null;
}
