import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "../../../../setup";
import { createMockH3Event } from "../../../../mock/h3-event";

useH3TestUtils();

const { mockRequireAuth } = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
}));

vi.mock("~~/server/utils/auth", () => ({
  requireAuth: mockRequireAuth,
}));

const mockUploadImage = vi.fn();

vi.mock("../../../../../server/controllers/upload/uploadImage", () => ({
  uploadImage: mockUploadImage,
}));

const mockUploadResult = {
  url: "/uploads/avatars/mocked-UUID.jpg",
  filename: "mocked-UUID.jpg",
  size: 1024,
  mimetype: "image/jpeg",
};

describe("CreateImage controller", async () => {
  const mockAuthUser = {
    user_id: "user123",
    email: "test@example.com",
    role: UserSchemaRole.ADMIN,
  } as AuthUser;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUploadImage.mockResolvedValue(mockUploadResult);
  });

  const handler =
    await import("../../../../../server/api/v1/upload/image.post");

  describe("authentication", () => {
    it("should call requireAuth with event", async () => {
      // Arrange: prepare event with query params
      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        query: { category: UploadCategory.AVATARS },
      });

      // Act: call handler
      await handler.default(event);

      // Assert: requireAuth was called with event
      expect(mockRequireAuth).toHaveBeenCalledTimes(1);
      expect(mockRequireAuth).toHaveBeenCalledWith(event);
    });

    it("should throw 401 when user is not authenticated", async () => {
      // Arrange: make requireAuth throw 401
      mockRequireAuth.mockImplementationOnce(() => {
        throw createError({
          statusCode: 401,
          statusMessage: "Unauthorized",
          message: "Authentication invalid",
        });
      });

      const event = createMockH3Event({});

      // Act: call handler
      const result = handler.default(event);

      // Assert: 401 error is thrown
      await expect(result).rejects.toMatchObject({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "Authentication invalid",
      });
    });
  });

  describe("category validation", () => {
    it("should use default AVATARS category when category is not provided", async () => {
      // Arrange: prepare event without category query param
      const event = createMockH3Event({
        query: {},
      });

      // Act: call handler
      await handler.default(event);

      // Assert: uploadImage was called with default AVATARS category
      expect(mockUploadImage).toHaveBeenCalledWith(
        event,
        UploadCategory.AVATARS,
      );
    });

    it("should pass valid category to uploadImage", async () => {
      // Arrange: prepare event with valid category query param
      const event = createMockH3Event({
        query: { category: UploadCategory.AVATARS },
      });

      // Act: call handler
      await handler.default(event);

      // Assert: uploadImage was called with provided category
      expect(mockUploadImage).toHaveBeenCalledWith(
        event,
        UploadCategory.AVATARS,
      );
    });

    it("should throw 400 when category is invalid", async () => {
      // Arrange: prepare event with invalid category query param
      const event = createMockH3Event({
        query: { category: "invalid-category" },
      });

      // Act: call handler
      const result = handler.default(event);

      // Assert: 400 error is thrown with message about allowed categories
      await expect(result).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: expect.stringContaining("Invalid category parameter"),
      });
    });

    it("should throw 400 with list of allowed categories in message", async () => {
      // Arrange: prepare event with invalid category query param
      const event = createMockH3Event({
        query: { category: "invalid-category" },
      });

      // Act: call handler
      const result = handler.default(event);

      // Assert: error message contains all valid categories
      await expect(result).rejects.toMatchObject({
        message: expect.stringContaining(
          Object.values(UploadCategory).join(", "),
        ),
      });
    });
  });

  describe("successful upload", () => {
    it("should return success response with upload data", async () => {
      // Arrange: prepare event with valid category
      const event = createMockH3Event({
        query: { category: UploadCategory.AVATARS },
      });

      // Act: call handler
      const result = await handler.default(event);

      // Assert: result contains success flag and upload data
      expect(result).toEqual({
        success: true,
        data: mockUploadResult,
      });
    });

    it("should call uploadImage with event and validated category", async () => {
      // Arrange: prepare event with valid category
      const event = createMockH3Event({
        query: { category: UploadCategory.AVATARS },
      });

      // Act: call handler
      await handler.default(event);

      // Assert: uploadImage was called once with correct arguments
      expect(mockUploadImage).toHaveBeenCalledTimes(1);
      expect(mockUploadImage).toHaveBeenCalledWith(
        event,
        UploadCategory.AVATARS,
      );
    });
  });
});
