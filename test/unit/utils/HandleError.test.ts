import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ZodError } from "zod";
import { handleError } from "../../../app/utils/handleError";
import { showErrorToast } from "../../../app/utils/toastNotification";

vi.mock("../../../app/utils/toastNotification", () => ({
  showErrorToast: vi.fn(),
}));

describe("handleError util", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Zod validation errors", () => {
    it("should handle ZodError with single issue", () => {
      const zodError = new ZodError([
        {
          code: "invalid_type",
          expected: "string",
          input: "number",
          path: ["email"],
          message: "Expected string, received number",
        },
      ]);

      handleError(zodError);

      expect(showErrorToast).toHaveBeenCalledWith(
        "Expected string, received number",
      );
    });

    it("should use fallback message when ZodError has no issues", () => {
      const zodError = new ZodError([]);

      handleError(zodError, "Custom fallback");

      expect(showErrorToast).toHaveBeenCalledWith("Invalid data format");
    });
  });

  describe("Fetch errors with response data", () => {
    it("should handle fetch error with message property", () => {
      const error = {
        data: {
          message: "User already exists",
        },
      };

      handleError(error);

      expect(showErrorToast).toHaveBeenCalledWith("User already exists");
    });

    it("should prioritize message over error property", () => {
      const error = {
        data: {
          message: "Primary message",
          error: "Secondary error",
        },
      };

      handleError(error);

      expect(showErrorToast).toHaveBeenCalledWith("Primary message");
    });

    it("should use fallback when fetch error has no message or error", () => {
      const error = {
        data: {
          statusCode: 500,
        },
      };

      handleError(error, "Server error occurred");

      expect(showErrorToast).toHaveBeenCalledWith("Server error occurred");
    });
  });

  describe("Network errors", () => {
    it("should handle fetch network error", () => {
      const error = new TypeError("Failed to fetch");

      handleError(error);

      expect(showErrorToast).toHaveBeenCalledWith(
        "Network error. Please try again later.",
      );
    });
  });

  describe("Fallback error handling", () => {
    it("should use default fallback message", () => {
      const error = new Error("Unknown error");

      handleError(error);

      expect(showErrorToast).toHaveBeenCalledWith("Unexpected error");
    });

    it("should log unhandled error to console", () => {
      const error = new Error("Unhandled");

      handleError(error);

      expect(console.error).toHaveBeenCalledWith("Unhandled error:", error);
    });
  });

  describe("Edge cases", () => {
    it("should handle null error", () => {
      handleError(null, "Null error");

      expect(showErrorToast).toHaveBeenCalledWith("Null error");
    });

    it("should handle string error", () => {
      handleError("Error message", "Fallback");

      expect(showErrorToast).toHaveBeenCalledWith("Fallback");
    });

    it("should handle object without data property", () => {
      const error = { foo: "bar" };

      handleError(error, "Invalid object");

      expect(showErrorToast).toHaveBeenCalledWith("Invalid object");
    });

    it("should handle empty string message in fetch error", () => {
      const errorObject = {
        data: {
          message: "",
          error: "Fallback error",
        },
      };

      handleError(errorObject);

      expect(showErrorToast).toHaveBeenCalledWith("Fallback error");
    });
  });

  describe("Integration scenarios", () => {
    it("should handle API validation error response", () => {
      const error = {
        data: {
          message: "Email validation failed",
          statusCode: 400,
        },
      };

      handleError(error);

      expect(showErrorToast).toHaveBeenCalledWith("Email validation failed");
    });

    it("should handle unauthorized error", () => {
      const error = {
        data: {
          error: "Unauthorized access",
          statusCode: 401,
        },
      };

      handleError(error);

      expect(showErrorToast).toHaveBeenCalledWith("Unauthorized access");
    });

    it("should handle server error", () => {
      const error = {
        data: {
          message: "Internal server error",
          statusCode: 500,
        },
      };

      handleError(error);

      expect(showErrorToast).toHaveBeenCalledWith("Internal server error");
    });

    it("should handle multiple validation errors from Zod", () => {
      const zodError = new ZodError([
        {
          code: "invalid_type",
          expected: "string",
          input: "undefined",
          path: ["email"],
          message: "Email is required",
        },
        {
          code: "invalid_type",
          expected: "string",
          input: "undefined",
          path: ["password"],
          message: "Password is required",
        },
      ]);

      handleError(zodError);

      expect(showErrorToast).toHaveBeenCalledWith("Email is required");
    });
  });
});
