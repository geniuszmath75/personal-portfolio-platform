import { beforeEach, describe, vi, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../server/models/User";
import mongoose from "mongoose";

// Type for mocking jwt.sign
type SignType = (
  payload: Parameters<typeof jwt.sign>[0],
  secret: Parameters<typeof jwt.sign>[1],
  options?: Parameters<typeof jwt.sign>[2],
) => string;

// Type for mocking bcrypt.compare
type CompareType = (password: string, hash: string) => Promise<boolean>;

// Mocked dependencies
vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

vi.stubGlobal("useRuntimeConfig", () => ({
  jwtSecret: "testsecret",
  jwtLifetime: "10m",
}));

describe("User model", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * EMAIL
   */
  describe("email", () => {
    it("should be required", () => {
      const user = new User({
        password: "password123",
        username: "testuser",
      });

      const validationError = user.validateSync();
      expect(validationError?.errors.email).toBeDefined();
      expect(validationError?.errors.email?.message).toBe("Email is required");
    });

    it("should reject invalid format", () => {
      const user = new User({
        email: "not-an-email",
        password: "password123",
        username: "testuser",
      });

      const validationError = user.validateSync();
      expect(validationError?.errors.email).toBeDefined();
      expect(validationError?.errors.email?.message).toBe("Email is not valid");
    });
  });

  /**
   * PASSWORD
   */
  describe("password", () => {
    it("should be required", () => {
      const user = new User({
        email: "test@example.com",
        username: "testuser",
      });

      const validationError = user.validateSync();
      expect(validationError?.errors.password).toBeDefined();
      expect(validationError?.errors.password?.message).toBe(
        "Password is required",
      );
    });

    it("should reject too short password", () => {
      const user = new User({
        email: "test@example.com",
        password: "short",
        username: "testuser",
      });

      const validationError = user.validateSync();
      expect(validationError?.errors.password).toBeDefined();
      expect(validationError?.errors.password?.message).toBe(
        "Password must be at least 8 characters long",
      );
    });
  });

  /**
   * USERNAME
   */
  describe("username", () => {
    it("should be required", () => {
      const user = new User({
        email: "test@example.com",
        password: "password123",
      });

      const validationError = user.validateSync();
      expect(validationError?.errors.username).toBeDefined();
      expect(validationError?.errors.username?.message).toBe(
        "Username is required",
      );
    });

    it("should reject too short username", () => {
      const user = new User({
        email: "test@example.com",
        password: "password123",
        username: "ab",
      });

      const validationError = user.validateSync();
      expect(validationError?.errors.username).toBeDefined();
      expect(validationError?.errors.username?.message).toBe(
        "Username must be at least 3 characters long",
      );
    });

    it("should reject too long username", () => {
      const longName = "a".repeat(51);
      const user = new User({
        email: "test@example.com",
        password: "password123",
        username: longName,
      });

      const validationError = user.validateSync();
      expect(validationError?.errors.username).toBeDefined();
      expect(validationError?.errors.username?.message).toBe(
        "Username must be at most 50 characters long",
      );
    });
  });

  /**
   * ROLE
   */
  describe("role", () => {
    it("should set default role to ADMIN", () => {
      const user = new User({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      });

      expect(user.role).toBe("ADMIN");
    });

    it("should reject invalid role", () => {
      const user = new User({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
        role: "INVALID_ROLE",
      });

      const validationError = user.validateSync();
      expect(validationError?.errors.role).toBeDefined();
    });
  });

  /**
   * AVATAR
   */
  describe("avatar", () => {
    it("should allow empty value", () => {
      const user = new User({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      });

      const validationError = user.validateSync();
      expect(validationError).toBeUndefined();
      expect(user.avatar).toBeUndefined();
    });

    it("should accept String value", () => {
      const user = new User({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
        avatar: "https://example.com/avatar.png",
      });

      const validationError = user.validateSync();
      expect(validationError).toBeUndefined();
      expect(user.avatar).toBe("https://example.com/avatar.png");
    });
  });

  /**
   * CREATE_JWT
   */
  describe("createJWT", () => {
    it("should generate JWT with correct payload", () => {
      const fakeUser = new User({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
        role: "ADMIN",
      });

      const fakeId = new mongoose.Types.ObjectId();
      fakeUser._id = fakeId;

      const signSpy = vi
        .spyOn(jwt, "sign")
        .mockImplementation((() => "fake-token") as SignType);

      const token = fakeUser.createJWT();
      expect(token).toBe("fake-token");
      expect(signSpy).toHaveBeenCalledWith(
        { userId: fakeId, email: "test@example.com", role: "ADMIN" },
        "testsecret",
        { expiresIn: "10m" },
      );
    });
  });

  /**
   * COMPARE_PASSWORD
   */
  describe("comparePassword", () => {
    it("should compare passwords correctly", async () => {
      const fakeUser = new User({
        email: "test@example.com",
        password: "hashed-password",
        username: "testuser",
      });

      const compareSpy = vi
        .spyOn(bcrypt, "compare")
        .mockImplementation((async () => true) as CompareType);

      const result = await fakeUser.comparePassword("plain-password");
      expect(result).toBe(true);
      expect(compareSpy).toHaveBeenCalledWith(
        "plain-password",
        "hashed-password",
      );
    });
  });
});
