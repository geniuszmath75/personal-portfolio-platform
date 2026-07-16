import { beforeEach, describe, expect, it, vi } from "vitest";
import { Types } from "mongoose";
import { useH3TestUtils } from "~~/test/setup";
import { createMockH3Event } from "~~/test/mock/h3-event";
import { BlockKind, ISectionType, UserSchemaRole } from "~~/shared/types/enums";

useH3TestUtils();

const { mockRequireAdmin } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
}));

const { mockFindById } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
}));

const { mockFindByIdAndUpdate } = vi.hoisted(() => ({
  mockFindByIdAndUpdate: vi.fn(),
}));

const { mockUpdateMany } = vi.hoisted(() => ({
  mockUpdateMany: vi.fn(),
}));

const { mockHandleDatabaseError } = vi.hoisted(() => ({
  mockHandleDatabaseError: vi.fn(),
}));

vi.mock("~~/server/utils/auth", () => ({
  requireAdmin: mockRequireAdmin,
}));

vi.mock("~~/server/models/Section", () => ({
  Section: {
    findById: mockFindById,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    updateMany: mockUpdateMany,
  },
}));

vi.mock("~~/server/utils/handleDatabaseError", () => ({
  handleDatabaseError: mockHandleDatabaseError,
}));

describe("updateSection controller", async () => {
  const mockAuthUser = {
    user_id: "user123",
    email: "test@example.com",
    role: UserSchemaRole.ADMIN,
  } as AuthUser;

  const validId = new Types.ObjectId();

  const mockSectionBody = {
    title: "Hero Section",
    slug: "hero",
    type: ISectionType.HERO,
    order: 2,
    blocks: [
      {
        kind: BlockKind.PARAGRAPH,
        paragraphs: ["Welcome to my portfolio"],
      },
    ],
  };

  const existingSection = {
    _id: validId,
    ...mockSectionBody,
    order: 2,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockUpdateMany.mockResolvedValue({ modifiedCount: 0 });
    mockFindById.mockResolvedValue(existingSection);
  });

  const handler = await import("~~/server/api/v1/sections/[id].put");

  describe("Authorization", () => {
    it("should call requireAdmin to verify admin role", async () => {
      mockFindByIdAndUpdate.mockResolvedValue({
        _id: validId,
        ...mockSectionBody,
      });

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: mockSectionBody,
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
        params: { id: validId.toString() },
        body: mockSectionBody,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 403,
      });

      expect(mockFindById).not.toHaveBeenCalled();
      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("Route param validation", () => {
    it("should throw 400 for invalid section id", async () => {
      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: "not-a-valid-id" },
        body: mockSectionBody,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Invalid section id",
      });

      expect(mockFindById).not.toHaveBeenCalled();
      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("Request body validation", () => {
    it("should throw 400 for invalid title (too short)", async () => {
      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: { ...mockSectionBody, title: "ab" },
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
      });

      expect(mockFindById).not.toHaveBeenCalled();
      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should throw 400 for too short slug", async () => {
      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: { ...mockSectionBody, slug: "a" },
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
      });

      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should throw 400 for empty blocks array", async () => {
      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: { ...mockSectionBody, blocks: [] },
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
      });

      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should throw 400 for zero order", async () => {
      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: { ...mockSectionBody, order: 0 },
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
      });

      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("Section lookup", () => {
    it("should throw 404 when section is not found before update", async () => {
      mockFindById.mockResolvedValue(null);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: mockSectionBody,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Section not found",
      });

      expect(mockUpdateMany).not.toHaveBeenCalled();
      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("Order shifting", () => {
    it("should not shift siblings when order is unchanged", async () => {
      mockFindByIdAndUpdate.mockResolvedValue({
        _id: validId,
        ...mockSectionBody,
      });

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: { ...mockSectionBody, order: 2 },
      });

      await handler.default(event);

      expect(mockUpdateMany).not.toHaveBeenCalled();
      expect(mockFindByIdAndUpdate).toHaveBeenCalled();
    });

    it("should shift siblings down when moving section later", async () => {
      mockFindById.mockResolvedValue({ ...existingSection, order: 1 });
      mockFindByIdAndUpdate.mockResolvedValue({
        _id: validId,
        ...mockSectionBody,
        order: 3,
      });

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: { ...mockSectionBody, order: 3 },
      });

      await handler.default(event);

      expect(mockUpdateMany).toHaveBeenCalledWith(
        {
          _id: { $ne: validId.toString() },
          order: { $gt: 1, $lte: 3 },
        },
        { $inc: { order: -1 } },
      );
      expect(mockUpdateMany).toHaveBeenCalledBefore(mockFindByIdAndUpdate);
    });

    it("should shift siblings up when moving section earlier", async () => {
      mockFindById.mockResolvedValue({ ...existingSection, order: 4 });
      mockFindByIdAndUpdate.mockResolvedValue({
        _id: validId,
        ...mockSectionBody,
        order: 2,
      });

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: { ...mockSectionBody, order: 2 },
      });

      await handler.default(event);

      expect(mockUpdateMany).toHaveBeenCalledWith(
        {
          _id: { $ne: validId.toString() },
          order: { $gte: 2, $lt: 4 },
        },
        { $inc: { order: 1 } },
      );
      expect(mockUpdateMany).toHaveBeenCalledBefore(mockFindByIdAndUpdate);
    });
  });

  describe("Section update", () => {
    it("should update section with validated data", async () => {
      const updatedSection = { _id: validId, ...mockSectionBody };
      mockFindByIdAndUpdate.mockResolvedValue(updatedSection);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: mockSectionBody,
      });

      const result = await handler.default(event);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        validId.toString(),
        mockSectionBody,
        {
          returnDocument: "after",
          runValidators: true,
          context: "query",
        },
      );
      expect(result.section).toEqual(updatedSection);
    });

    it("should return section in response", async () => {
      const updatedSection = { _id: validId, title: "Updated title" };
      mockFindByIdAndUpdate.mockResolvedValue(updatedSection);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: mockSectionBody,
      });

      const result = await handler.default(event);

      expect(result).toHaveProperty("section");
      expect(result.section).toEqual(updatedSection);
    });

    it("should throw 404 when findByIdAndUpdate returns null", async () => {
      mockFindByIdAndUpdate.mockResolvedValue(null);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: mockSectionBody,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Section not found",
      });
    });
  });

  describe("Database errors", () => {
    it("should handle unexpected database errors via handleDatabaseError", async () => {
      const dbError = new Error("DB connection failed");
      mockFindByIdAndUpdate.mockRejectedValue(dbError);
      mockHandleDatabaseError.mockReturnValue({
        code: 500,
        statusMessage: "Internal Server Error",
        message: "DB connection failed",
      });

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: mockSectionBody,
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
      mockFindByIdAndUpdate.mockRejectedValue(h3Error);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: mockSectionBody,
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
        ...mockSectionBody,
        title: undefined,
      };

      mockFindByIdAndUpdate.mockResolvedValue(sectionWithoutTitle);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: sectionWithoutTitle,
      });

      const result = await handler.default(event);

      expect(result.section).toBeDefined();
    });
  });
});
