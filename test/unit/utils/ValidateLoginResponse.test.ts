import { describe, it, expect } from "vitest";
import {
  loginResponseSchema,
  authUserSchema,
} from "../../../app/utils/validateLoginResponse";
import { UserSchemaRole } from "../../../server/types/enums";

describe("validateLoginResponse util", () => {
  // Valid test data
  const validAuthUser = {
    user: {
      user_id: "68a9d098b70e48772cd5ceaa",
      email: "user@example.com",
      role: UserSchemaRole.GUEST,
    },
  };

  const validLoginResponse = {
    user: { ...validAuthUser.user },
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  };

  describe("Valid auth user", () => {
    it("should validate correct auth user", () => {
      const result = authUserSchema.parse(validAuthUser);
      expect(result).toEqual(validAuthUser);
    });

    it("should validate with admin role", () => {
      const response = {
        ...validAuthUser,
        user: {
          ...validAuthUser.user,
          role: UserSchemaRole.ADMIN,
        },
      };
      const result = authUserSchema.parse(response);
      expect(result.user.role).toBe(UserSchemaRole.ADMIN);
    });
  });

  describe("Valid login response", () => {
    it("should validate correct login response", () => {
      const result = loginResponseSchema.parse(validLoginResponse);
      expect(result).toEqual(validLoginResponse);
    });
  });

  describe("Email validation", () => {
    it("should reject invalid email format", () => {
      const response = {
        ...validAuthUser,
        user: {
          ...validAuthUser.user,
          email: "invalid-email",
        },
      };
      expect(() => authUserSchema.parse(response)).toThrow();
    });

    it("should reject email with null value", () => {
      const response = {
        ...validAuthUser,
        user: {
          ...validAuthUser.user,
          email: null,
        },
      };
      expect(() => authUserSchema.parse(response)).toThrow();
    });

    it("should reject email with undefined value", () => {
      const response = {
        ...validAuthUser,
        user: {
          ...validAuthUser.user,
          email: undefined,
        },
      };
      expect(() => authUserSchema.parse(response)).toThrow();
    });

    it("should reject empty string email", () => {
      const response = {
        ...validAuthUser,
        user: {
          ...validAuthUser.user,
          email: "",
        },
      };
      expect(() => authUserSchema.parse(response)).toThrow();
    });
  });

  describe("Role validation", () => {
    it("should reject invalid role", () => {
      const response = {
        ...validAuthUser,
        user: {
          ...validAuthUser.user,
          role: "INVALID_ROLE",
        },
      };
      expect(() => authUserSchema.parse(response)).toThrow();
    });
  });

  describe("Token validation", () => {
    it("should reject invalid JWT token", () => {
      const response = {
        ...validLoginResponse,
        token: "invalid-token",
      };
      expect(() => loginResponseSchema.parse(response)).toThrow();
    });

    it("should reject null token", () => {
      const response = {
        ...validLoginResponse,
        token: null,
      };
      expect(() => loginResponseSchema.parse(response)).toThrow();
    });

    it("should reject undefined token", () => {
      const response = {
        ...validLoginResponse,
        token: undefined,
      };
      expect(() => loginResponseSchema.parse(response)).toThrow();
    });
  });
});
