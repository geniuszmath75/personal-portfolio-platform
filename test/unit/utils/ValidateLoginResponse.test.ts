import { describe, it, expect } from "vitest";
import { loginResponseSchema } from "../../../app/utils/validateLoginResponse";
import { UserSchemaRole } from "../../../server/types/enums";

describe("validateLoginResponse util", () => {
  // Valid test data
  const validLoginResponse = {
    user: {
      email: "user@example.com",
      role: UserSchemaRole.GUEST,
    },
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  };

  describe("Valid login response", () => {
    it("should validate correct login response", () => {
      const result = loginResponseSchema.parse(validLoginResponse);
      expect(result).toEqual(validLoginResponse);
    });

    it("should validate with admin role", () => {
      const response = {
        ...validLoginResponse,
        user: {
          ...validLoginResponse.user,
          role: UserSchemaRole.ADMIN,
        },
      };
      const result = loginResponseSchema.parse(response);
      expect(result.user.role).toBe(UserSchemaRole.ADMIN);
    });
  });

  describe("Email validation", () => {
    it("should reject invalid email format", () => {
      const response = {
        ...validLoginResponse,
        user: {
          ...validLoginResponse.user,
          email: "invalid-email",
        },
      };
      expect(() => loginResponseSchema.parse(response)).toThrow();
    });

    it("should reject email with null value", () => {
      const response = {
        ...validLoginResponse,
        user: {
          ...validLoginResponse.user,
          email: null,
        },
      };
      expect(() => loginResponseSchema.parse(response)).toThrow();
    });

    it("should reject email with undefined value", () => {
      const response = {
        ...validLoginResponse,
        user: {
          ...validLoginResponse.user,
          email: undefined,
        },
      };
      expect(() => loginResponseSchema.parse(response)).toThrow();
    });

    it("should reject empty string email", () => {
      const response = {
        ...validLoginResponse,
        user: {
          ...validLoginResponse.user,
          email: "",
        },
      };
      expect(() => loginResponseSchema.parse(response)).toThrow();
    });
  });

  describe("Role validation", () => {
    it("should reject invalid role", () => {
      const response = {
        ...validLoginResponse,
        user: {
          ...validLoginResponse.user,
          role: "INVALID_ROLE",
        },
      };
      expect(() => loginResponseSchema.parse(response)).toThrow();
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
