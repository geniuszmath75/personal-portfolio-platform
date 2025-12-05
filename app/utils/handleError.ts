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
