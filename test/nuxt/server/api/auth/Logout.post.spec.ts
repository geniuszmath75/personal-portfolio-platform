import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockH3Event } from "../../../../mock/h3-event";
import { useH3TestUtils } from "../../../../setup";

vi.mock("../../../../../server/controllers/logoutUser");

useH3TestUtils();

describe("POST /api/v1/auth/logout", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const controllerHandler = await import(
    "../../../../../server/controllers/logoutUser"
  );
  const logoutHandler = await import(
    "../../../../../server/api/v1/auth/logout.post"
  );

  it("should call logout controller with event and returns result", async () => {
    // Arrange: create mock event
    const event = createMockH3Event({});
    // Mock controller response
    const fakeResponse = { success: true };

    vi.mocked(controllerHandler.default).mockResolvedValue(fakeResponse);

    // Act: call logout endpoint handler
    const result = await logoutHandler.default(event);

    // Assert: verify controller was called and response returned
    expect(controllerHandler.default).toHaveBeenCalledWith(event);
    expect(result).toEqual(fakeResponse);
  });
});
