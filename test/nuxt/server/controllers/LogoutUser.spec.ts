import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "../../../setup";
import { createMockH3Event } from "../../../mock/h3-event";

useH3TestUtils();

vi.mock("../../../../server/utils/auth", () => ({
  requireAuth: vi.fn(),
}));

describe("logoutUser controller", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const handler = await import("../../../../server/api/v1/auth/logout.post");

  it("should 'requireAuth' be called with event", async () => {
    const { requireAuth } = await import("../../../../server/utils/auth");

    const event = createMockH3Event({});

    await handler.default(event);

    expect(requireAuth).toHaveBeenCalledTimes(1);
    expect(requireAuth).toHaveBeenCalledWith(event);
  });

  it("should delete auth_token cookie and return correct response", async () => {
    // Arrange: get deleteCookie mock from h3 utils
    const { deleteCookie } = useH3TestUtils();

    const event = createMockH3Event({});

    // Act: call handler
    const result = await handler.default(event);

    // Assert: verify deleteCookie was called with correct parameters
    expect(deleteCookie).toHaveBeenCalledWith(event, "auth_token");

    // And verify correct response is returned
    expect(result).toEqual({
      success: true,
    });
  });
});
