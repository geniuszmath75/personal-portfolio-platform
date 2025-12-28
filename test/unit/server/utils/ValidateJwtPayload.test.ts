import { describe, it, expect } from "vitest";
import { jwtPayloadSchema } from "../../../../server/utils/validateJwtPayload";
import { UserSchemaRole } from "../../../../server/types/enums";

describe("validateJwtPayload util", () => {
  // Valid test data
  const validJwtPayload = {
    userId: "68a9d098b70e48772cd5ceaa",
    email: "user@example.com",
    role: UserSchemaRole.GUEST,
  };

  describe("Valid JWT payload", () => {
    it("should validate correct JWT payload", () => {
      const result = jwtPayloadSchema.parse(validJwtPayload);
      expect(result).toEqual(validJwtPayload);
    });

    it("should validate with different valid roles", () => {
      const adminPayload = { ...validJwtPayload, role: UserSchemaRole.ADMIN };
      const result = jwtPayloadSchema.parse(adminPayload);
      expect(result.role).toBe(UserSchemaRole.ADMIN);
    });

    it("should validate with different valid email formats", () => {
      const payload = {
        ...validJwtPayload,
        email: "user.name+tag@example.co.uk",
      };
      const result = jwtPayloadSchema.parse(payload);
      expect(result.email).toBe("user.name+tag@example.co.uk");
    });
  });

  describe("UserId validation", () => {
    it("should reject invalid userId format (not valid MongoDB ObjectId)", () => {
      const payload = { ...validJwtPayload, userId: "invalid-id" };
      expect(() => jwtPayloadSchema.parse(payload)).toThrow();
    });

    it("should reject userId with invalid characters", () => {
      const payload = {
        ...validJwtPayload,
        userId: "68a9d098b70e48772cd5ceaz",
      };
      expect(() => jwtPayloadSchema.parse(payload)).toThrow();
    });

    it("should reject userId that is too short", () => {
      const payload = { ...validJwtPayload, userId: "68a9d098" };
      expect(() => jwtPayloadSchema.parse(payload)).toThrow();
    });

    it("should reject null userId", () => {
      const payload = { ...validJwtPayload, userId: null };
      expect(() => jwtPayloadSchema.parse(payload)).toThrow();
    });
  });

  describe("Email validation", () => {
    it("should reject invalid email format", () => {
      const payload = { ...validJwtPayload, email: "invalid-email" };
      expect(() => jwtPayloadSchema.parse(payload)).toThrow();
    });

    it("should reject email without domain", () => {
      const payload = { ...validJwtPayload, email: "user@" };
      expect(() => jwtPayloadSchema.parse(payload)).toThrow();
    });

    it("should reject null email", () => {
      const payload = { ...validJwtPayload, email: null };
      expect(() => jwtPayloadSchema.parse(payload)).toThrow();
    });
  });

  describe("Role validation", () => {
    it("should reject invalid role", () => {
      const payload = { ...validJwtPayload, role: "INVALID_ROLE" };
      expect(() => jwtPayloadSchema.parse(payload)).toThrow();
    });

    it("should reject null role", () => {
      const payload = { ...validJwtPayload, role: null };
      expect(() => jwtPayloadSchema.parse(payload)).toThrow();
    });
  });

  describe("Missing required fields", () => {
    it("should reject payload without userId", () => {
      const payload = { email: "user@example.com", role: UserSchemaRole.GUEST };
      expect(() => jwtPayloadSchema.parse(payload)).toThrow();
    });

    it("should reject payload without email", () => {
      const payload = {
        userId: "68a9d098b70e48772cd5ceaa",
        role: UserSchemaRole.GUEST,
      };
      expect(() => jwtPayloadSchema.parse(payload)).toThrow();
    });

    it("should reject payload without role", () => {
      const payload = {
        userId: "68a9d098b70e48772cd5ceaa",
        email: "user@example.com",
      };
      expect(() => jwtPayloadSchema.parse(payload)).toThrow();
    });
  });
});
