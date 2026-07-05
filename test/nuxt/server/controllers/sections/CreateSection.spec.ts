import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "~~/test/setup";
import { createMockH3Event } from "~~/test/mock/h3-event";
import { BlockKind, ISectionType, UserSchemaRole } from "~~/shared/types/enums";

useH3TestUtils();

const { mockRequireAdmin } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
}));

const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}));

const { mockHandleDatabaseError } = vi.hoisted(() => ({
  mockHandleDatabaseError: vi.fn(),
}));

vi.mock("~~/server/utils/auth", () => ({
  requireAdmin: mockRequireAdmin,
}));

vi.mock("~~/server/models/Section", () => ({
  Section: {
    create: mockCreate,
  },
}));

vi.mock("~~/server/utils/handleDatabaseError", () => ({
  handleDatabaseError: mockHandleDatabaseError,
}));

describe("createSection controller", async () => {
  const mockAuthUser = {
    user_id: "user123",
    email: "test@example.com",
    role: UserSchemaRole.ADMIN,
  } as AuthUser;

  const mockSection = {
    title: "Hero Section",
    slug: "hero",
    type: ISectionType.HERO,
    order: 1,
    blocks: [
      {
        kind: BlockKind.PARAGRAPH,
        paragraphs: ["Welcome to my portfolio"],
      },
    ],
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  const handler = await import("~~/server/api/v1/sections/index.post");

  describe("Authorization", () => {
    it("should call requireAdmin to verify admin role", async () => {
      mockCreate.mockResolvedValue(mockSection);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: mockSection,
      });

      await handler.default(event);

      expect(mockRequireAdmin).toHaveBeenCalledWith(event);
      expect(mockRequireAdmin).toHaveBeenCalledTimes(1);
    });

    it("should throw 403 if requireAdmin throws", async () => {
      mockRequireAdmin.mockImplementation(() => {
        throw createError({
          statusCode: 403,
          statusMessage: "Forbidden",
          message: "Admin access required",
        });
      });

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: false },
        body: mockSection,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 403,
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe("Validation", () => {
    it("should throw 400 for invalid title (too short)", async () => {
      const invalidSection = {
        ...mockSection,
        title: "ab",
      };

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: invalidSection,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("should throw 400 for too short slug", async () => {
      const invalidSection = {
        ...mockSection,
        slug: "a",
      };

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: invalidSection,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("should throw 400 for empty blocks array", async () => {
      const invalidSection = {
        ...mockSection,
        blocks: [],
      };

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: invalidSection,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("should throw 400 for invalid block data", async () => {
      const invalidSection = {
        ...mockSection,
        blocks: [{ kind: BlockKind.PARAGRAPH, paragraphs: [] }],
      };

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: invalidSection,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("should throw 400 for zero order", async () => {
      const invalidSection = {
        ...mockSection,
        order: 0,
      };

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: invalidSection,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe("Section creation", () => {
    it("should create section with validated data", async () => {
      const createdSection = { _id: "123", ...mockSection };
      mockCreate.mockResolvedValue(createdSection);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: mockSection,
      });

      const result = await handler.default(event);

      expect(mockCreate).toHaveBeenCalledWith(mockSection);
      expect(result.section).toEqual(createdSection);
    });

    it("should return section in response", async () => {
      const createdSection = { _id: "123", ...mockSection };
      mockCreate.mockResolvedValue(createdSection);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: mockSection,
      });

      const result = await handler.default(event);

      expect(result).toHaveProperty("section");
      expect(result.section._id).toBe("123");
    });
  });

  describe("Database errors", () => {
    it("should handle unexpected database errors via handleDatabaseError", async () => {
      const dbError = new Error("DB connection failed");
      mockCreate.mockRejectedValue(dbError);
      mockHandleDatabaseError.mockReturnValue({
        code: 500,
        statusMessage: "Internal Server Error",
        message: "DB connection failed",
      });

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: mockSection,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 500,
        statusMessage: "Internal Server Error",
      });

      expect(mockHandleDatabaseError).toHaveBeenCalledWith(dbError);
    });

    it("should rethrow H3Error without passing through handleDatabaseError", async () => {
      const h3Error = createError({
        statusCode: 422,
        statusMessage: "Unprocessable Entity",
        message: "Validation failed",
      });
      mockCreate.mockRejectedValue(h3Error);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: mockSection,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 422,
      });

      expect(mockHandleDatabaseError).not.toHaveBeenCalled();
    });
  });

  describe("Optional fields", () => {
    it("should accept section without title", async () => {
      const sectionWithoutTitle = {
        ...mockSection,
        title: undefined,
      };

      mockCreate.mockResolvedValue(sectionWithoutTitle);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: sectionWithoutTitle,
      });

      const result = await handler.default(event);

      expect(result.section).toBeDefined();
    });
  });
});
