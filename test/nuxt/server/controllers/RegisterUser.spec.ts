import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "../../../setup";
import { createMockH3Event } from "../../../mock/h3-event";
import { User } from "../../../../server/models/User";
import mongoose from "mongoose";
import { handleDatabaseError } from "../../../../server/utils/handleDatabaseError";

vi.mock("../../../../server/models/User");
vi.mock("../../../../server/utils/handleDatabaseError");

useH3TestUtils();

describe("registerUser controller", async () => {
  const mockUser = {
    username: "testuser",
    email: "test@example.com",
    password: "hashedPassword123",
  };

  const mockRequestBody = {
    username: "testuser",
    email: "test@example.com",
    password: "password123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const handler = await import("../../../../server/api/v1/auth/register.post");

  /**
   * Successful registration
   */
  describe("successful registration", () => {
    it("should create a new user and return 201 status with user data", async () => {
      // Arrange
      const event = createMockH3Event({
        body: mockRequestBody,
      });

      vi.mocked(User.create).mockResolvedValue(mockUser as never);

      // Act
      const result = await handler.default(event);

      // Assert
      expect(User.create).toHaveBeenCalledWith({
        username: mockRequestBody.username,
        email: mockRequestBody.email,
        password: mockRequestBody.password,
      });
      expect(result).toEqual({
        user: {
          username: mockRequestBody.username,
          email: mockRequestBody.email,
        },
      });
    });

    it("should not return password in response", async () => {
      // Arrange
      const event = createMockH3Event({
        body: mockRequestBody,
      });

      vi.mocked(User.create).mockResolvedValue(mockUser as never);

      // Act
      const result = await handler.default(event);

      // Assert
      expect(result).toEqual({
        user: {
          username: mockRequestBody.username,
          email: mockRequestBody.email,
        },
      });
      expect(result).not.toHaveProperty("user.password");
    });
  });

  /**
   * Request body handling
   */
  describe("Request body handling", () => {
    it("should extract only username, email, and password from request body", async () => {
      // Arrange
      const event = createMockH3Event({
        body: {
          username: "testuser",
          email: "test@example.com",
          password: "password123",
          extraField: "should be ignored",
          role: "ADMIN",
        },
      });

      vi.mocked(User.create).mockResolvedValue(mockUser as never);

      // Act
      await handler.default(event);

      // Assert
      expect(User.create).toHaveBeenCalledWith({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  /**
   * Validation errors
   */
  describe("Validation errors", () => {
    it("should throw 400 when body has validation error", async () => {
      // Arrange
      const event = createMockH3Event({
        body: {
          username: "",
          email: "invalid-email",
          password: "123",
        },
      });

      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = {
        email: {
          message: "Please provide a valid email",
        } as mongoose.Error.ValidatorError,
      };

      const customError = {
        code: 400,
        statusMessage: "Bad Request",
        message: "Please provide a valid email",
      };

      vi.mocked(User.create).mockRejectedValue(validationError);
      vi.mocked(handleDatabaseError).mockReturnValue(customError);

      // Act & Assert
      await expect(handler.default(event)).rejects.toThrow();
      expect(handleDatabaseError).toHaveBeenCalledWith(validationError);
    });

    it("should handle multiple validation errors", async () => {
      // Arrange
      const event = createMockH3Event({
        body: {
          username: "",
          email: "",
          password: "",
        },
      });

      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = {
        username: {
          message: "Username is required",
        } as mongoose.Error.ValidatorError,
        email: {
          message: "Email is required",
        } as mongoose.Error.ValidatorError,
        password: {
          message: "Password is required",
        } as mongoose.Error.ValidatorError,
      };

      const customError = {
        code: 400,
        statusMessage: "Bad Request",
        message:
          "Username is required; Email is required; Password is required",
      };

      vi.mocked(User.create).mockRejectedValue(validationError);
      vi.mocked(handleDatabaseError).mockReturnValue(customError);

      // Act & Assert
      await expect(handler.default(event)).rejects.toThrow();
      expect(handleDatabaseError).toHaveBeenCalledWith(validationError);
    });
  });

  /**
   * Duplicate key errors
   */
  describe("Duplicate key errors", () => {
    it("should handle duplicate email error and throw 400", async () => {
      // Arrange
      const event = createMockH3Event({
        body: mockRequestBody,
      });

      const duplicateError = new mongoose.mongo.MongoServerError({
        message: "E11000 duplicate key error",
      });
      duplicateError.code = 11000;
      duplicateError.keyValue = { email: mockRequestBody.email };

      const customError = {
        code: 400,
        statusMessage: "Bad Request",
        message:
          "Duplicate value entered for email field, please choose another value.",
      };

      vi.mocked(User.create).mockRejectedValue(duplicateError);
      vi.mocked(handleDatabaseError).mockReturnValue(customError);

      // Act & Assert
      await expect(handler.default(event)).rejects.toThrow();
      expect(handleDatabaseError).toHaveBeenCalledWith(duplicateError);
    });
  });
});
