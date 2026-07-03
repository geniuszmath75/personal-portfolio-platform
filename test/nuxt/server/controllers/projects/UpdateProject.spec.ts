import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "~~/test/setup";
import { createMockH3Event } from "~~/test/mock/h3-event";
import {
  ProjectSourceType,
  ProjectStatusType,
  UserSchemaRole,
} from "~~/shared/types/enums";
import { Types } from "mongoose";

useH3TestUtils();

const { mockRequireAdmin } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
}));

const { mockFindByIdAndUpdate } = vi.hoisted(() => ({
  mockFindByIdAndUpdate: vi.fn(),
}));

const { mockHandleDatabaseError } = vi.hoisted(() => ({
  mockHandleDatabaseError: vi.fn(),
}));

vi.mock("~~/server/utils/auth", () => ({
  requireAdmin: mockRequireAdmin,
}));

vi.mock("~~/server/models/Project", () => ({
  Project: {
    findByIdAndUpdate: mockFindByIdAndUpdate,
  },
}));

vi.mock("~~/server/utils/handleDatabaseError", () => ({
  handleDatabaseError: mockHandleDatabaseError,
}));

describe("updateProject controller", async () => {
  const mockAuthUser = {
    user_id: "user123",
    email: "test@example.com",
    role: UserSchemaRole.ADMIN,
  } as AuthUser;

  const validId = new Types.ObjectId();

  const mockImageData = {
    srcPath: "image.png",
    altText: "Test image",
  };

  const mockProjectBody = {
    title: "My Project",
    technologies: ["Vue", "TypeScript"],
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    shortDescription: "A short description",
    longDescription:
      "This is a long description that contains enough characters to pass validation requirements for the project",
    githubLink: "https://github.com/user/project",
    projectSource: ProjectSourceType.HOBBY,
    websiteLink: "https://example.com",
    mainImage: mockImageData,
    otherImages: [mockImageData],
    status: ProjectStatusType.COMPLETED,
    gainedExperience: ["Learned Vue 3", "TypeScript skills"],
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  const handler = await import("~~/server/api/v1/projects/[id].put");

  describe("Authorization", () => {
    it("should call requireAdmin to verify admin role", async () => {
      mockFindByIdAndUpdate.mockResolvedValue({
        _id: validId,
        ...mockProjectBody,
      });

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: mockProjectBody,
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
        body: mockProjectBody,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 403,
      });

      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("Route param validation", () => {
    it("should throw 400 for invalid project id", async () => {
      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: "not-a-valid-id" },
        body: mockProjectBody,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Invalid project id",
      });

      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("Request body validation", () => {
    it("should throw 400 for invalid title (too short)", async () => {
      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: { ...mockProjectBody, title: "AB" },
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
      });

      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should throw 400 for empty technologies array", async () => {
      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: { ...mockProjectBody, technologies: [] },
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
      });

      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("Project update", () => {
    it("should update project with validated data", async () => {
      const updatedProject = { _id: validId, ...mockProjectBody };
      mockFindByIdAndUpdate.mockResolvedValue(updatedProject);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: mockProjectBody,
      });

      const result = await handler.default(event);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        validId.toString(),
        expect.objectContaining({
          title: mockProjectBody.title,
          technologies: mockProjectBody.technologies,
          startDate: expect.any(Date),
          endDate: expect.any(Date),
          mainImage: mockProjectBody.mainImage,
        }),
        {
          returnDocument: "after",
          runValidators: true,
          context: "query",
        },
      );
      expect(result.project).toEqual(updatedProject);
    });

    it("should return project in response", async () => {
      const updatedProject = { _id: validId, title: "Updated title" };
      mockFindByIdAndUpdate.mockResolvedValue(updatedProject);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: mockProjectBody,
      });

      const result = await handler.default(event);

      expect(result).toHaveProperty("project");
      expect(result.project).toEqual(updatedProject);
    });

    it("should throw 404 when project is not found", async () => {
      mockFindByIdAndUpdate.mockResolvedValue(null);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        params: { id: validId.toString() },
        body: mockProjectBody,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Project not found",
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
        body: mockProjectBody,
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
        body: mockProjectBody,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 422,
      });

      expect(mockHandleDatabaseError).not.toHaveBeenCalled();
    });
  });
});
