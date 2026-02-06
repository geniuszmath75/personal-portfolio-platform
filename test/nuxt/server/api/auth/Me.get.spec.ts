import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockH3Event } from "../../../../mock/h3-event";
import { useH3TestUtils } from "../../../../setup";
import { UserSchemaRole } from "../../../../../server/types/enums";

vi.mock("../../../../../server/controllers/getMeUser");

useH3TestUtils();

describe("GET /api/v1/auth/me", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const controllerHandler =
    await import("../../../../../server/controllers/getMeUser");
  const getMeHandler = await import("../../../../../server/api/v1/auth/me.get");

  it("should call getMeUser controller with event and returns result", async () => {
    // Arrange: create mock event
    const mockAuthUser = {
      user_id: "123",
      email: "test@gmail.com",
      role: UserSchemaRole.GUEST,
    };
    const event = createMockH3Event({
      context: { user: mockAuthUser, isAuthenticated: true },
    });
    // Mock controller response
    const fakeResponse = { user: mockAuthUser };

    vi.mocked(controllerHandler.default).mockResolvedValue(fakeResponse);

    // Act: call getMeUser endpoint handler
    const result = await getMeHandler.default(event);

    // Assert: verify controller was called and response returned
    expect(controllerHandler.default).toHaveBeenCalledWith(event);
    expect(result).toEqual(fakeResponse);
  });
});
