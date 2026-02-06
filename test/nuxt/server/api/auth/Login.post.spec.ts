import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockH3Event } from "../../../../mock/h3-event";
import { UserSchemaRole } from "../../../../../server/types/enums";
import { useH3TestUtils } from "../../../../setup";

vi.mock("../../../../../server/controllers/loginUser");

useH3TestUtils();

describe("POST /api/v1/auth/login", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const authHandler =
    await import("../../../../../server/controllers/loginUser");
  const loginHandler =
    await import("../../../../../server/api/v1/auth/login.post");

  it("should call auth controller with event and returns result", async () => {
    // Arrange: create mock event with body
    const event = createMockH3Event({ body: { email: "a", password: "b" } });
    // Mock controller response
    const fakeResponse = {
      user: { email: "a", role: UserSchemaRole.ADMIN },
      token: "jwt",
    };

    vi.mocked(authHandler.default).mockResolvedValue(fakeResponse);

    // Act: call login endpoint handler
    const result = await loginHandler.default(event);

    // Assert: verify controller was called and response returned
    expect(authHandler.default).toHaveBeenCalledWith(event);
    expect(result).toEqual(fakeResponse);
  });
});
