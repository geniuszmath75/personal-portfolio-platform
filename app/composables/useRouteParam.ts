/**
 * Utility composable to safely extract a single route parameter as a string.
 *
 * @param param - The name of the route parameter (e.g. "id")
 * @returns The route parameter value as a string
 * @throws Error if the parameter is missing or not a string
 */
export function useRouteParam(param: string): string {
  const value = useRoute().params[param];
  if (typeof value !== "string") {
    throw new Error(`Route param "${value}" is required and must be a string.`);
  }
  return value;
}
