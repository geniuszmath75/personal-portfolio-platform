import { describe, it, expect, vi } from "vitest";
import mongoose from "mongoose";
import { createError, H3Error } from "h3";
import {
  handleDatabaseError,
  rethrowAsHttpError,
} from "../../../../server/utils/handleDatabaseError";

describe("handleDatabaseError util", () => {
  /**
   * Default error handling
   */
  describe("default error handling", () => {
    it("should return default error for unknown error type", () => {
      // Arrange
      const errorMessage = "Some random error";
      const unknownError = new Error(errorMessage);

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      const result = handleDatabaseError(unknownError);

      // Assert
      expect(result).toEqual({
        code: 500,
        statusMessage: "Internal Server Error",
        message: "Something went wrong, please try again later.",
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Unhandled database error:",
        errorMessage,
        unknownError.stack,
      );

      consoleErrorSpy.mockRestore();
    });

    it("should return default error for null", () => {
      // Act
      const result = handleDatabaseError(null);

      // Assert
      expect(result).toEqual({
        code: 500,
        statusMessage: "Internal Server Error",
        message: "Something went wrong, please try again later.",
      });
    });

    it("should return default error for undefined", () => {
      // Act
      const result = handleDatabaseError(undefined);

      // Assert
      expect(result).toEqual({
        code: 500,
        statusMessage: "Internal Server Error",
        message: "Something went wrong, please try again later.",
      });
    });

    it("should return default error for string", () => {
      // Act
      const result = handleDatabaseError("error string");

      // Assert
      expect(result).toEqual({
        code: 500,
        statusMessage: "Internal Server Error",
        message: "Something went wrong, please try again later.",
      });
    });
  });

  /**
   * Mongoose Validation Error handling
   */
  describe("Mongoose ValidationError handling", () => {
    it("should handle single validation error", () => {
      // Arrange
      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = {
        email: {
          message: "Email is required",
        } as mongoose.Error.ValidatorError,
      };

      // Act
      const result = handleDatabaseError(validationError);

      // Assert
      expect(result).toEqual({
        code: 400,
        statusMessage: "Bad Request",
        message: "Email is required",
      });
    });

    it("should handle multiple validation errors with semicolon separator", () => {
      // Arrange
      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = {
        email: {
          message: "Email is required",
        } as mongoose.Error.ValidatorError,
        username: {
          message: "Username must be at least 3 characters",
        } as mongoose.Error.ValidatorError,
        password: {
          message: "Password is required",
        } as mongoose.Error.ValidatorError,
      };

      // Act
      const result = handleDatabaseError(validationError);

      // Assert
      expect(result.code).toBe(400);
      expect(result.statusMessage).toBe("Bad Request");
      expect(result.message).toContain("Email is required");
      expect(result.message).toContain(
        "Username must be at least 3 characters",
      );
      expect(result.message).toContain("Password is required");
      expect(result.message?.split("; ").length).toBe(3);
    });

    it("should handle validation error with empty errors object", () => {
      // Arrange
      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = {};

      // Act
      const result = handleDatabaseError(validationError);

      // Assert
      expect(result).toEqual({
        code: 400,
        statusMessage: "Bad Request",
        message: "",
      });
    });
  });

  /**
   * Mongoose CastError handling
   */
  describe("Mongoose CastError handling", () => {
    it("should return bad request with field path in message", () => {
      // Arrange
      const castError = new mongoose.Error.CastError(
        "ObjectId",
        "invalid-id",
        "_id",
      );

      // Act
      const result = handleDatabaseError(castError);

      // Assert
      expect(result).toEqual({
        code: 400,
        statusMessage: "Bad Request",
        message: "Invalid value for field '_id'",
      });
    });
  });

  /**
   * MongoDB Duplicate Key Error handling
   */
  describe("MongoDB MongoServerError (duplicate key) handling", () => {
    it("should handle duplicate key error for email field", () => {
      // Arrange
      const duplicateError = new mongoose.mongo.MongoServerError({
        message: "E11000 duplicate key error",
      });
      duplicateError.code = 11000;
      duplicateError.keyValue = { email: "test@example.com" };

      // Act
      const result = handleDatabaseError(duplicateError);

      // Assert
      expect(result).toEqual({
        code: 400,
        statusMessage: "Bad Request",
        message:
          "Duplicate value entered for email field, please choose another value.",
      });
    });

    it("should handle duplicate key error for username field", () => {
      // Arrange
      const duplicateError = new mongoose.mongo.MongoServerError({
        message: "E11000 duplicate key error",
      });
      duplicateError.code = 11000;
      duplicateError.keyValue = { username: "john_doe" };

      // Act
      const result = handleDatabaseError(duplicateError);

      // Assert
      expect(result).toEqual({
        code: 400,
        statusMessage: "Bad Request",
        message:
          "Duplicate value entered for username field, please choose another value.",
      });
    });

    it("should handle duplicate key error with multiple fields (compound index)", () => {
      // Arrange
      const duplicateError = new mongoose.mongo.MongoServerError({
        message: "E11000 duplicate key error",
      });
      duplicateError.code = 11000;
      duplicateError.keyValue = { email: "test@example.com", tenant: "acme" };

      // Act
      const result = handleDatabaseError(duplicateError);

      // Assert
      expect(result.code).toBe(400);
      expect(result.statusMessage).toBe("Bad Request");
      // Should use the first key
      expect(result.message).toBe(
        "Duplicate value entered for email field, please choose another value.",
      );
    });

    it("should return default error for MongoServerError with different error code", () => {
      // Arrange
      const errorMessage = "Some other MongoDB error";
      const serverError = new mongoose.mongo.MongoServerError({
        message: errorMessage,
      });
      serverError.code = 12345; // Different error code

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      const result = handleDatabaseError(serverError);

      // Assert
      expect(result).toEqual({
        code: 500,
        statusMessage: "Internal Server Error",
        message: "Something went wrong, please try again later.",
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Unhandled database error:",
        errorMessage,
        serverError.stack,
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("rethrowAsHttpError", () => {
    it("should rethrow H3Error unchanged", () => {
      const h3Error = createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Missing",
      });

      expect(() => rethrowAsHttpError(h3Error)).toThrow(H3Error);
      try {
        rethrowAsHttpError(h3Error);
      } catch (error) {
        expect(error).toBe(h3Error);
      }
    });

    it("should map unknown errors to a 500 createError", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      try {
        rethrowAsHttpError(new Error("boom"));
        expect.unreachable();
      } catch (error) {
        expect(error).toMatchObject({
          statusCode: 500,
          statusMessage: "Internal Server Error",
          message: "Something went wrong, please try again later.",
        });
      }

      consoleErrorSpy.mockRestore();
    });
  });
});
