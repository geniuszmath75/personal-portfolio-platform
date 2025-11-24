import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import { handleDatabaseError } from "../../../../server/utils/handleDatabaseError";

describe("handleDatabaseError util", () => {
  /**
   * Default error handling
   */
  describe("default error handling", () => {
    it("should return default error for unknown error type", () => {
      // Arrange
      const unknownError = new Error("Some random error");

      // Act
      const result = handleDatabaseError(unknownError);

      // Assert
      expect(result).toEqual({
        code: 500,
        statusMessage: "Internal Server Error",
        message: "Something went wrong, please try again later.",
      });
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
      const serverError = new mongoose.mongo.MongoServerError({
        message: "Some other MongoDB error",
      });
      serverError.code = 12345; // Different error code

      // Act
      const result = handleDatabaseError(serverError);

      // Assert
      expect(result).toEqual({
        code: 500,
        statusMessage: "Internal Server Error",
        message: "Something went wrong, please try again later.",
      });
    });
  });
});
