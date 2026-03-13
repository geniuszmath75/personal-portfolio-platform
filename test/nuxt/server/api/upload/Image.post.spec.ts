import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockH3Event } from "../../../../mock/h3-event";
import { UploadCategory } from "../../../../../shared/types/enums";
import { useH3TestUtils } from "../../../../setup";

vi.mock("../../../../../server/controllers/upload/createImage");

useH3TestUtils();

describe("POST /api/v1/upload/image", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const controllerHandler =
    await import("../../../../../server/controllers/upload/createImage");
  const endpointHandler =
    await import("../../../../../server/api/v1/upload/image.post");

  it("should call auth controller with event and returns result", async () => {
    // Arrange: create mock event with body
    const event = createMockH3Event({
      query: { category: UploadCategory.AVATARS },
    });

    // Mock controller response
    const fakeResponse = {
      success: true,
      data: {
        url: "/uploads/avatar/123.png",
        filename: "filename",
        size: 1024,
        mimetype: "image/png",
      },
    };

    vi.mocked(controllerHandler.default).mockResolvedValue(fakeResponse);

    // Act: call login endpoint handler
    const result = await endpointHandler.default(event);

    // Assert: verify controller was called and response returned
    expect(controllerHandler.default).toHaveBeenCalledWith(event);
    expect(result).toEqual(fakeResponse);
  });
});
