import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "../../../../setup";
import { createMockH3Event } from "../../../../mock/h3-event";
import { UserSchemaRole } from "../../../../../shared/types/enums";
import { User } from "../../../../../server/models/User";
import type {
  AuthUser,
  IUser,
  IUserMethods,
} from "../../../../../shared/types";
import type { HydratedDocument } from "mongoose";

useH3TestUtils();

vi.mock("../../../../../server/models/User");
vi.mock("../../../../../server/utils/auth", () => ({
  requireAdmin: vi.fn(),
}));

describe("GetAdminProfile controller", async () => {
  const mockAuthUser = {
    user_id: "user123",
    email: "test@example.com",
    role: UserSchemaRole.ADMIN,
  } as AuthUser;

  const mockGuestUser = {
    user_id: "user123",
    email: "test@example.com",
    role: UserSchemaRole.GUEST,
  } as AuthUser;

  const mockAdminUser = {
    email: "test@example.com",
    username: "Admin",
    avatar: null,
    role: UserSchemaRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(User, "findOne");
  });

  const handler =
    await import("../../../../../server/api/v1/admin/profile/index.get");

  it("should 'requireAdmin' be called with event", async () => {
    const { requireAdmin } = await import("../../../../../server/utils/auth");

    vi.mocked(User.findOne).mockResolvedValue(
      mockAdminUser as unknown as HydratedDocument<IUser, IUserMethods>,
    );

    const event = createMockH3Event({
      context: { user: mockAuthUser, isAuthenticated: true },
    });

    await handler.default(event);

    expect(requireAdmin).toHaveBeenCalledTimes(1);
    expect(requireAdmin).toHaveBeenCalledWith(event);
  });

  it("should return Admin profile when Admin user exists", async () => {
    // Arrange: prepare event with user in context
    const event = createMockH3Event({
      context: { user: mockAuthUser, isAuthenticated: true },
    });
    vi.mocked(User.findOne).mockResolvedValue(
      mockAdminUser as unknown as HydratedDocument<IUser, IUserMethods>,
    );

    // Act: call handler
    const result = await handler.default(event);

    // Assert: result contains the authenticated user
    expect(result).toEqual({
      admin: {
        email: mockAdminUser.email,
        username: mockAdminUser.username,
        avatar: mockAdminUser.avatar,
        role: mockAdminUser.role,
        createdAt: mockAdminUser.createdAt,
        updatedAt: mockAdminUser.updatedAt,
      },
    });
  });

  it("should throw 403 when authenticated user is not Admin", async () => {
    // Arrange: prepare event without user in context
    const { requireAdmin } = await import("../../../../../server/utils/auth");

    vi.mocked(requireAdmin).mockImplementationOnce(() => {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "Admin access required",
      });
    });

    const event = createMockH3Event({
      context: { user: mockGuestUser, isAuthenticated: true },
    });

    // Act + Assert: handler should throw 403
    await expect(handler.default(event)).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "Admin access required",
    });
  });

  it("should throw 404 when Admin profile not found", async () => {
    // Arrange: user doesn't exist in DB
    vi.mocked(User.findOne).mockResolvedValue(null);

    const event = createMockH3Event({
      context: { user: mockAuthUser, isAuthenticated: true },
    });

    // Act + Assert: handler should throw 404
    await expect(handler.default(event)).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "User with ADMIN role not found",
    });
  });
});
