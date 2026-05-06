import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "~~/test/setup";
import { createMockH3Event } from "~~/test/mock/h3-event";
import {
  ProjectSourceType,
  ProjectStatusType,
  UserSchemaRole,
} from "~~/shared/types/enums";

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

vi.mock("~~/server/models/Project", () => ({
  Project: {
    create: mockCreate,
  },
}));
vi.mock("~~/server/utils/handleDatabaseError", () => ({
  handleDatabaseError: mockHandleDatabaseError,
}));

describe("createProject controller", async () => {
  const mockAuthUser = {
    user_id: "user123",
    email: "test@example.com",
    role: UserSchemaRole.ADMIN,
  } as AuthUser;

  const mockImageData = {
    srcPath: "image.png",
    altText: "Test image",
  };

  const mockProject = {
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

  const handler = await import("~~/server/api/v1/projects/index.post");

  describe("Authorization", () => {
    it("should call requireAdmin to verify admin role", async () => {
      mockCreate.mockResolvedValue(mockProject);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: mockProject,
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
        body: mockProject,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 403,
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe("Validation", () => {
    it("should throw 400 for invalid title (too short)", async () => {
      const invalidProject = {
        ...mockProject,
        title: "AB",
      };

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: invalidProject,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("should throw 400 for empty technologies array", async () => {
      const invalidProject = {
        ...mockProject,
        technologies: [],
      };

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: invalidProject,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("should throw 400 for short shortDescription", async () => {
      const invalidProject = {
        ...mockProject,
        shortDescription: "",
      };

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: invalidProject,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("should throw 400 for short longDescription", async () => {
      const invalidProject = {
        ...mockProject,
        longDescription: "Too short",
      };

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: invalidProject,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("should throw 400 for invalid GitHub URL (HTTP instead of HTTPS)", async () => {
      const invalidProject = {
        ...mockProject,
        githubLink: "http://github.com/user/repo",
      };

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: invalidProject,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("should throw 400 for invalid main image", async () => {
      const invalidProject = {
        ...mockProject,
        mainImage: {
          srcPath: "file.pdf",
          altText: "Alt text",
        },
      };

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: invalidProject,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("should throw 400 for empty gainedExperience array", async () => {
      const invalidProject = {
        ...mockProject,
        gainedExperience: [],
      };

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: invalidProject,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe("Project creation", () => {
    it("should create project with validated data", async () => {
      const createdProject = { _id: "123", ...mockProject };
      mockCreate.mockResolvedValue(createdProject);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: mockProject,
      });

      const result = await handler.default(event);

      expect(result.project).toEqual(createdProject);
    });

    it("should return project in response", async () => {
      const createdProject = { _id: "123", ...mockProject };
      mockCreate.mockResolvedValue(createdProject);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: mockProject,
      });

      const result = await handler.default(event);

      expect(result).toHaveProperty("project");
      expect(result.project._id).toBe("123");
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
        body: mockProject,
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
        body: mockProject,
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 422,
      });

      expect(mockHandleDatabaseError).not.toHaveBeenCalled();
    });
  });

  describe("Optional fields", () => {
    it("should accept project without endDate", async () => {
      const projectWithoutEndDate = {
        ...mockProject,
        endDate: undefined,
      };

      mockCreate.mockResolvedValue(projectWithoutEndDate);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: projectWithoutEndDate,
      });

      const result = await handler.default(event);

      expect(result.project).toBeDefined();
    });

    it("should accept project without githubLink", async () => {
      const projectWithoutGithub = {
        ...mockProject,
        githubLink: undefined,
      };

      mockCreate.mockResolvedValue(projectWithoutGithub);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: projectWithoutGithub,
      });

      const result = await handler.default(event);

      expect(result.project).toBeDefined();
    });

    it("should accept project without websiteLink", async () => {
      const projectWithoutWebsite = {
        ...mockProject,
        websiteLink: undefined,
      };

      mockCreate.mockResolvedValue(projectWithoutWebsite);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: projectWithoutWebsite,
      });

      const result = await handler.default(event);

      expect(result.project).toBeDefined();
    });

    it("should accept project without otherImages", async () => {
      const projectWithoutOtherImages = {
        ...mockProject,
        otherImages: undefined,
      };

      mockCreate.mockResolvedValue(projectWithoutOtherImages);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: projectWithoutOtherImages,
      });

      const result = await handler.default(event);

      expect(result.project).toBeDefined();
    });
  });
});
