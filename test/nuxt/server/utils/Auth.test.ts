import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { createMockH3Event } from "../../../mock/h3-event";
import { useH3TestUtils } from "../../../setup";
import { UserSchemaRole } from "../../../../server/types/enums";
import jwt from "jsonwebtoken";
import { requireAdmin, requireAuth } from "../../../../server/utils/auth";

mockNuxtImport("useRuntimeConfig", () => {
  return () => {
    return {
      jwtSecret: "secretvalue",
    };
  };
});

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

vi.mock("../../../../server/utils/validateJwtPayload", () => ({
  jwtPayloadSchema: {
    parse: vi.fn((p) => p),
  },
}));

const jwtVerifyMock = vi.mocked(jwt.verify) as ReturnType<typeof vi.fn>;

const { getCookie } = useH3TestUtils();

describe("authentication utils", () => {
  const validJwtPayload = {
    userId: "68a9d098b70e48772cd5ceaa",
    email: "user@example.com",
    role: UserSchemaRole.ADMIN,
  };

  const validToken = "valid.jwt.token";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requireAuth", () => {
    it("should throw 401 if no token cookie exists", () => {
      getCookie.mockReturnValue(null);

      const event = createMockH3Event({});

      expect(() => requireAuth(event)).toThrow(
        expect.objectContaining({
          statusCode: 401,
          statusMessage: "Unauthorized",
        }),
      );
    });

    it("should throw 401 if token is invalid", () => {
      getCookie.mockReturnValue("invalid.token");
      jwtVerifyMock.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const event = createMockH3Event({});

      expect(() => requireAuth(event)).toThrow(
        expect.objectContaining({
          statusCode: 401,
          statusMessage: "Unauthorized",
        }),
      );
    });

    it("should set user context on valid token", () => {
      getCookie.mockReturnValue(validToken);
      jwtVerifyMock.mockReturnValue(validJwtPayload);

      const event = createMockH3Event({});

      requireAuth(event);

      expect(event.context.user).toEqual({
        user_id: validJwtPayload.userId,
        email: validJwtPayload.email,
        role: validJwtPayload.role,
      });
      expect(event.context.isAuthenticated).toBe(true);
    });

    it("should verify token with correct secret", () => {
      getCookie.mockReturnValue(validToken);
      jwtVerifyMock.mockReturnValue(validJwtPayload);

      const event = createMockH3Event({});

      requireAuth(event);

      expect(jwt.verify).toHaveBeenCalledWith(validToken, "secretvalue");
    });

    it("should read token from auth_token cookie", () => {
      getCookie.mockReturnValue(validToken);
      jwtVerifyMock.mockReturnValue(validJwtPayload);

      const event = createMockH3Event({});

      requireAuth(event);

      expect(getCookie).toHaveBeenCalledWith(event, "auth_token");
    });
  });

  describe("requireAdmin", () => {
    it("should throw 403 if user is not ADMIN", () => {
      getCookie.mockReturnValue(validToken);
      jwtVerifyMock.mockReturnValue({
        ...validJwtPayload,
        role: UserSchemaRole.GUEST,
      });

      const event = createMockH3Event({});

      expect(() => requireAdmin(event)).toThrow(
        expect.objectContaining({
          statusCode: 403,
          statusMessage: "Forbidden",
        }),
      );
    });

    it("should allow access if user is ADMIN", () => {
      getCookie.mockReturnValue(validToken);
      jwtVerifyMock.mockReturnValue({
        ...validJwtPayload,
        role: UserSchemaRole.ADMIN,
      });

      const event = createMockH3Event({});

      expect(() => requireAdmin(event)).not.toThrow();
      expect(event.context.isAuthenticated).toBe(true);
    });

    it("should throw 401 if token is missing (auth fails before role check)", () => {
      getCookie.mockReturnValue(null);

      const event = createMockH3Event({});

      expect(() => requireAdmin(event)).toThrow(
        expect.objectContaining({
          statusCode: 401,
        }),
      );
    });
  });
});
