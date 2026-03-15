import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "../../../../setup";
import { createMockH3Event } from "../../../../mock/h3-event";
import { UserSchemaRole } from "../../../../../shared/types/enums";

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

vi.mock("~~/server/models/User", () => ({
  User: {
    findByIdAndUpdate: mockFindByIdAndUpdate,
  },
}));
vi.mock("~~/server/utils/handleDatabaseError", () => ({
  handleDatabaseError: mockHandleDatabaseError,
}));

describe("UpdateAdminProfile controller", async () => {
  const mockAuthUser = {
    user_id: "user123",
    email: "test@example.com",
    role: UserSchemaRole.ADMIN,
  } as AuthUser;

  const mockUpdatedUser = {
    _id: "user123",
    email: "updated@example.com",
    username: "updatedAdmin",
    avatar: "https://example.com/avatar.png",
    role: UserSchemaRole.ADMIN,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-06-01"),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  const handler =
    await import("../../../../../server/api/v1/admin/profile/index.patch");

  describe("Authorization", () => {
    it("should call requireAdmin to verify admin role", async () => {
      mockFindByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: { username: "newUsername" },
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
        body: { username: "newUsername" },
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 403,
      });

      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("Validation", () => {
    it("should return 400 when body contains invalid field types", async () => {
      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: { email: 12345 },
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
      });
    });

    it("should return 400 when no fields are provided", async () => {
      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: {},
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        message:
          "At least one field (username, email, avatar) must be provided",
      });
    });

    it("should return 400 when all fields are null", async () => {
      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: { username: null, email: null, avatar: null },
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
      });
    });
  });

  describe("Successful update", () => {
    it("should update only username when only username is provided", async () => {
      mockFindByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: { username: "  newAdmin  " },
      });

      const result = await handler.default(event);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        "user123",
        { username: "newAdmin" },
        { returnDocument: "after", runValidators: true },
      );
      expect(result).toHaveProperty("admin");
    });

    it("should update only email when only email is provided", async () => {
      mockFindByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: { email: "  NEW@EXAMPLE.COM  " },
      });

      await handler.default(event);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        "user123",
        { email: "new@example.com" },
        { returnDocument: "after", runValidators: true },
      );
    });

    it("should update only avatar when only avatar is provided", async () => {
      mockFindByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: { avatar: "  https://example.com/new-avatar.png  " },
      });

      await handler.default(event);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        "user123",
        { avatar: "https://example.com/new-avatar.png" },
        { returnDocument: "after", runValidators: true },
      );
    });

    it("should update all fields when all are provided", async () => {
      mockFindByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: {
          username: "newAdmin",
          email: "NEW@EXAMPLE.COM",
          avatar: "https://example.com/avatar.png",
        },
      });

      await handler.default(event);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        "user123",
        {
          username: "newAdmin",
          email: "new@example.com",
          avatar: "https://example.com/avatar.png",
        },
        { returnDocument: "after", runValidators: true },
      );
    });

    it("should return correct admin profile shape", async () => {
      mockFindByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: { username: "updatedAdmin" },
      });

      const result = (await handler.default(event)) as {
        admin: Record<string, unknown>;
      };

      expect(result.admin).toEqual({
        email: mockUpdatedUser.email,
        username: mockUpdatedUser.username,
        avatar: mockUpdatedUser.avatar,
        role: mockUpdatedUser.role,
        createdAt: mockUpdatedUser.createdAt,
        updatedAt: mockUpdatedUser.updatedAt,
      });
    });

    it("should trim whitespace from fields", async () => {
      mockFindByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: {
          username: "  spacedName  ",
          avatar: "  https://url.com  ",
        },
      });

      await handler.default(event);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        "user123",
        { username: "spacedName", avatar: "https://url.com" },
        { returnDocument: "after", runValidators: true },
      );
    });

    it("should use admin id from event context for the update", async () => {
      mockFindByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

      const customUser = { ...mockAuthUser, user_id: "adminABC" };
      const event = createMockH3Event({
        context: { user: customUser, isAuthenticated: true },
        body: { username: "newName" },
      });

      await handler.default(event);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        "adminABC",
        expect.any(Object),
        expect.any(Object),
      );
    });
  });

  describe("User not found", () => {
    it("should return 404 when user is not found in database", async () => {
      mockFindByIdAndUpdate.mockResolvedValue(null);

      const event = createMockH3Event({
        context: { user: mockAuthUser, isAuthenticated: true },
        body: { username: "newUsername" },
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "User not found",
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
        body: { username: "newUsername" },
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
        body: { username: "newUsername" },
      });

      await expect(handler.default(event)).rejects.toMatchObject({
        statusCode: 422,
      });

      expect(mockHandleDatabaseError).not.toHaveBeenCalled();
    });
  });
});
