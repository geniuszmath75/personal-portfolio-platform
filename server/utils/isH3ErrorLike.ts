import { H3Error } from "h3";

export function isH3ErrorLike(
  error: unknown,
): error is H3Error | { statusCode?: number; code?: number } {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as Record<string, unknown>;

  return (
    error instanceof H3Error ||
    typeof candidate.statusCode === "number" ||
    typeof candidate.code === "number"
  );
}
