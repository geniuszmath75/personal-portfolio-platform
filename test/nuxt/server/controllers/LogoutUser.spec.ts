import { describe, expect, it } from "vitest";
import { useH3TestUtils } from "../../../setup";
import { createMockH3Event } from "../../../mock/h3-event";

useH3TestUtils();

describe("logoutUser controller", async () => {
  const handler = await import("../../../../server/api/v1/auth/logout.post");

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
