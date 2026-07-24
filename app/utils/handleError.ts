import { ZodError } from "zod";
import { showErrorToast } from "./toastNotification";

/**
 * Type representing the possible error response structure from the backend.
 */
type AppErrorResponse = {
  message?: string;
  error?: string;
  statusCode?: number;
};

/**
 * Reads HTTP status from a `$fetch` / ofetch error when present.
 */
export function getErrorStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  if ("statusCode" in error && typeof error.statusCode === "number") {
    return error.statusCode;
  }

  if ("status" in error && typeof error.status === "number") {
    return error.status;
  }

  return undefined;
}

/**
 * Best-effort user-facing message from a `$fetch` / app error.
 */
export function getErrorMessage(
  error: unknown,
  fallbackMessage = "Unexpected error",
): string {
  if (error instanceof ZodError) {
    return error.issues?.[0]?.message || "Invalid data format";
  }

  if (error && typeof error === "object" && "data" in error) {
    const data = error.data as AppErrorResponse;
    if (data?.message) {
      return data.message;
    }
    if (data?.error) {
      return data.error;
    }
  }

  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "Network error. Please try again later.";
  }

  return fallbackMessage;
}

function statusMessageForCode(statusCode: number): string {
  switch (statusCode) {
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "Not Found";
    default:
      return "Error";
  }
}

/**
 * Re-throws an HTTP-aware Nuxt fatal error so `error.vue` can render.
 * Call this from route-driving fetches (single section / project).
 *
 * @throws always
 */
export function rethrowAsFatalPageError(
  error: unknown,
  fallbackMessage: string,
): never {
  const statusCode = getErrorStatusCode(error) ?? 500;

  throw createError({
    statusCode,
    statusMessage: statusMessageForCode(statusCode),
    message: getErrorMessage(error, fallbackMessage),
    fatal: true,
  });
}

/**
 * Function to handle different types of errors and display appropriate error
 * messages.
 *
 * @param error - The error object to handle.
 * @param fallbackMessage - The fallback message to display if no specific
 * message is found.
 */
export function handleError(
  error: unknown,
  fallbackMessage = "Unexpected error",
): void {
  // 1) Zod validation error
  if (error instanceof ZodError) {
    const firstIssue = error.issues?.[0];
    showErrorToast(firstIssue?.message || "Invalid data format");
    return;
  }

  // 2) Fetch error from $fetch
  if (error && typeof error === "object" && "data" in error) {
    const data = error.data as AppErrorResponse;

    // Backend returned { message }
    if (data.message) {
      showErrorToast(data.message);
      return;
    }

    // Backend returned { error }
    if (data.error) {
      showErrorToast(data.error);
      return;
    }
  }

  // 3) Browser/Network error
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    showErrorToast("Network error. Please try again later.");
    return;
  }

  // 4) Fallback
  console.error("Unhandled error:", error);
  showErrorToast(fallbackMessage);
}
