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

/**
 * Type guard to check if an object has a specific property.
 *
 * @param obj - The object to check.
 * @param property - The property name to look for.
 * @returns True if the object has the specified property, false otherwise.
 */
export function isObjectWithSpecificProperty<T>(
  obj: unknown,
  property: string,
): obj is T {
  return obj !== null && typeof obj === "object" && property in obj;
}
