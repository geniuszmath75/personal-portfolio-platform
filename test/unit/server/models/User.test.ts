import { beforeEach, describe, vi, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, userSchemaPreSave } from "../../../../server/models/User";
import mongoose from "mongoose";
import type { IUser } from "../../../../shared/types";

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
    genSalt: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

vi.stubGlobal("useRuntimeConfig", () => ({
  jwtSecret: "testsecret",
  jwtLifetime: "10",
}));

describe("User model", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * EMAIL
   */
  describe("email", () => {
    it("should be required", async () => {
      const user = new User({
        password: "password123",
        username: "testuser",
      });

      await expect(user.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          email: expect.objectContaining({ message: "Email is required" }),
        }),
      });
    });

    it("should reject invalid format", async () => {
      const user = new User({
        email: "not-an-email",
        password: "password123",
        username: "testuser",
      });

      await expect(user.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          email: expect.objectContaining({ message: "Email is not valid" }),
        }),
      });
    });
  });

  /**
   * PASSWORD
   */
  describe("password", () => {
    it("should be required", async () => {
      const user = new User({
        email: "test@example.com",
        username: "testuser",
      });

      await expect(user.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          password: expect.objectContaining({
            message: "Password is required",
          }),
        }),
      });
    });

    it("should reject too short password", async () => {
      const user = new User({
        email: "test@example.com",
        password: "Sh0r!",
        username: "testuser",
      });

      await expect(user.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          password: expect.objectContaining({
            message: "Password must be at least 8 characters long",
          }),
        }),
      });
    });

    it("should reject password without at least 1 uppercase letter", async () => {
      const user = new User({
        email: "test@example.com",
        password: "pass123!",
        username: "testuser",
      });

      await expect(user.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          password: expect.objectContaining({
            message:
              "Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character",
          }),
        }),
      });
    });

    it("should reject password without at least 1 lowercase letter", async () => {
      const user = new User({
        email: "test@example.com",
        password: "PASS123!",
        username: "testuser",
      });

      await expect(user.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          password: expect.objectContaining({
            message:
              "Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character",
          }),
        }),
      });
    });

    it("should reject password without at least 1 digit", async () => {
      const user = new User({
        email: "test@example.com",
        password: "Password!",
        username: "testuser",
      });

      await expect(user.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          password: expect.objectContaining({
            message:
              "Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character",
          }),
        }),
      });
    });

    it("should reject password without at least 1 special character", async () => {
      const user = new User({
        email: "test@example.com",
        password: "Pass1234",
        username: "testuser",
      });

      await expect(user.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          password: expect.objectContaining({
            message:
              "Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character",
          }),
        }),
      });
    });
  });

  /**
   * USERNAME
   */
  describe("username", () => {
    it("should be required", async () => {
      const user = new User({
        email: "test@example.com",
        password: "password123",
      });

      await expect(user.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          username: expect.objectContaining({
            message: "Username is required",
          }),
        }),
      });
    });

    it("should reject too short username", async () => {
      const user = new User({
        email: "test@example.com",
        password: "password123",
        username: "ab",
      });

      await expect(user.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          username: expect.objectContaining({
            message: "Username must be at least 3 characters long",
          }),
        }),
      });
    });

    it("should reject too long username", async () => {
      const longName = "a".repeat(51);
      const user = new User({
        email: "test@example.com",
        password: "password123",
        username: longName,
      });

      await expect(user.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          username: expect.objectContaining({
            message: "Username must be at most 50 characters long",
          }),
        }),
      });
    });
  });

  /**
   * ROLE
   */
  describe("role", () => {
    it("should set default role to GUEST", async () => {
      const user = new User({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      });

      expect(user.role).toBe("GUEST");
    });

    it("should reject invalid role", async () => {
      const user = new User({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
        role: "INVALID_ROLE",
      });

      await expect(user.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          role: expect.anything(),
        }),
      });
    });
  });

  /**
   * AVATAR
   */
  describe("avatar", () => {
    it("should set default value to null", async () => {
      const user = new User({
        email: "test@example.com",
        password: "Password123!",
        username: "testuser",
      });

      await expect(user.validate()).resolves.toBeUndefined();
      expect(user.avatar).toBeNull();
    });

    it("should accept String value", async () => {
      const user = new User({
        email: "test@example.com",
        password: "Password123!",
        username: "testuser",
        avatar: "https://example.com/avatar.png",
      });

      await expect(user.validate()).resolves.toBeUndefined();
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
        { expiresIn: 10 },
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

  /**
   * PRE SAVE HOOK
   */
  describe("pre save hook", () => {
    it("should hash password before saving", async () => {
      // Arrange
      const plainPassword = "Pass123!";
      const mockSalt = "mockedSalt123";
      const mockHashedPassword = "hashedPassword123";

      vi.mocked(bcrypt.genSalt).mockResolvedValue(mockSalt as never);
      vi.mocked(bcrypt.hash).mockResolvedValue(mockHashedPassword as never);

      const mockUser = {
        password: plainPassword,
      } as IUser;

      // Act
      await userSchemaPreSave.call(mockUser);

      // Assert
      expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, mockSalt);
      expect(mockUser.password).toBe(mockHashedPassword);
      expect(mockUser.password).not.toBe(plainPassword);
    });

    it("should generate salt with correct rounds (12)", async () => {
      // Arrange
      const mockSalt = "mockedSalt";
      const mockHashedPassword = "hashedPassword";

      vi.mocked(bcrypt.genSalt).mockResolvedValue(mockSalt as never);
      vi.mocked(bcrypt.hash).mockResolvedValue(mockHashedPassword as never);

      const mockUser = {
        password: "password123",
      } as IUser;

      // Act
      await userSchemaPreSave.call(mockUser);

      // Assert
      expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
    });

    it("should throw error if bcrypt.genSalt fails", async () => {
      // Arrange
      const error = new Error("Salt generation failed");
      vi.mocked(bcrypt.genSalt).mockRejectedValue(error);

      const mockUser = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      } as IUser;

      // Act & Assert
      await expect(userSchemaPreSave.call(mockUser)).rejects.toThrow(
        "Salt generation failed",
      );
      expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it("should throw error if bcrypt.hash fails", async () => {
      // Arrange
      const mockSalt = "salt";
      const error = new Error("Hash generation failed");

      vi.mocked(bcrypt.genSalt).mockResolvedValue(mockSalt as never);
      vi.mocked(bcrypt.hash).mockRejectedValue(error);

      const mockUser = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      } as IUser;

      // Act & Assert
      await expect(userSchemaPreSave.call(mockUser)).rejects.toThrow(
        "Hash generation failed",
      );
      expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", mockSalt);
    });
  });
});
