import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockH3Event } from "../../../../mock/h3-event";
import { useH3TestUtils } from "../../../../setup";

vi.mock("../../../../../server/controllers/registerUser");

useH3TestUtils();

describe("POST /api/v1/auth/registerUser", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const controllerHandler =
    await import("../../../../../server/controllers/registerUser");
  const registerHandler =
    await import("../../../../../server/api/v1/auth/register.post");

  it("should call register controller with event and returns result", async () => {
    // Arrange: create mock event with body
    const event = createMockH3Event({
      body: { email: "a", password: "b", username: "c" },
    });
    // Mock controller response
    const fakeResponse = {
      user: { email: "a", username: "c" },
    };

    vi.mocked(controllerHandler.default).mockResolvedValue(fakeResponse);

    // Act: call register endpoint handler
    const result = await registerHandler.default(event);

    // Assert: verify controller was called and response returned
    expect(controllerHandler.default).toHaveBeenCalledWith(event);
    expect(result).toEqual(fakeResponse);
  });
});
