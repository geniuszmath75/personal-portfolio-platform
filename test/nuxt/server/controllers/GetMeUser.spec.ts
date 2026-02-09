import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "../../../setup";
import { createMockH3Event } from "../../../mock/h3-event";
import type { AuthUser } from "../../../../shared/types";
import { UserSchemaRole } from "../../../../server/types/enums";

useH3TestUtils();

vi.mock("../../../../server/utils/auth", () => ({
  requireAuth: vi.fn(),
}));

describe("GetMeUser controller", async () => {
  const mockAuthUser = {
    user_id: "user123",
    email: "test@example.com",
    role: UserSchemaRole.GUEST,
  } as AuthUser;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const handler = await import("../../../../server/api/v1/auth/me.get");

  it("should 'requireAuth' be called with event", async () => {
    const { requireAuth } = await import("../../../../server/utils/auth");

    const event = createMockH3Event({
      context: { user: mockAuthUser, isAuthenticated: true },
    });

    await handler.default(event);

    expect(requireAuth).toHaveBeenCalledTimes(1);
    expect(requireAuth).toHaveBeenCalledWith(event);
  });

  it("should return authenticated user when user is present in event context", async () => {
    // Arrange: prepare event with user in context
    const event = createMockH3Event({
      context: { user: mockAuthUser, isAuthenticated: true },
    });

    // Act: call handler
    const result = await handler.default(event);

    // Assert: result contains the authenticated user
    expect(result).toEqual({
      user: mockAuthUser,
    });
  });

  it("should throw 401 when no authenticated user is present", async () => {
    // Arrange: prepare event without user in context
    const event = createMockH3Event({
      context: { user: null, isAuthenticated: false },
    });

    // Act + Assert: handler should throw 401
    await expect(handler.default(event)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Authentication invalid",
    });
  });
});
