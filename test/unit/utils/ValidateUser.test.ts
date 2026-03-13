import { describe, it, expect } from "vitest";
import {
  adminUserSchema,
  adminDetailsResponseSchema,
} from "../../../app/utils/validateUser";
import { UserSchemaRole } from "../../../shared/types/enums";

const validAdminUser = {
  email: "admin@example.com",
  username: "Admin",
  avatar: null,
  role: UserSchemaRole.ADMIN,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("adminUserSchema", () => {
  describe("valid data", () => {
    it("should parse valid admin user", () => {
      const result = adminUserSchema.safeParse({ admin: validAdminUser });

      expect(result.success).toBe(true);
    });

    it("should transform createdAt string to Date object", () => {
      const result = adminUserSchema.safeParse({ admin: validAdminUser });

      expect(result.success && result.data.admin.createdAt).toBeInstanceOf(
        Date,
      );
    });

    it("should transform updatedAt string to Date object", () => {
      const result = adminUserSchema.safeParse({ admin: validAdminUser });

      expect(result.success && result.data.admin.updatedAt).toBeInstanceOf(
        Date,
      );
    });

    it("should accept null as avatar", () => {
      const result = adminUserSchema.safeParse({
        admin: { ...validAdminUser, avatar: null },
      });

      expect(result.success).toBe(true);
    });

    it("should accept string as avatar", () => {
      const result = adminUserSchema.safeParse({
        admin: { ...validAdminUser, avatar: "https://example.com/avatar.png" },
      });

      expect(result.success).toBe(true);
    });
  });

  describe("invalid data", () => {
    it("should fail for invalid email", () => {
      const result = adminUserSchema.safeParse({
        admin: { ...validAdminUser, email: "invalid-email" },
      });

      expect(result.success).toBe(false);
    });

    it("should fail for invalid role", () => {
      const result = adminUserSchema.safeParse({
        admin: { ...validAdminUser, role: "INVALID_ROLE" },
      });

      expect(result.success).toBe(false);
    });

    it("should fail when required field is missing", () => {
      const { email: _, ...withoutEmail } = validAdminUser;
      const result = adminUserSchema.safeParse({ admin: withoutEmail });

      expect(result.success).toBe(false);
    });
  });
});

describe("adminDetailsResponseSchema", () => {
  it("should parse valid response", () => {
    const result = adminDetailsResponseSchema.safeParse({
      admin: validAdminUser,
    });

    expect(result.success).toBe(true);
  });

  it("should fail for missing admin object", () => {
    const result = adminDetailsResponseSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
