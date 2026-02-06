import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "../../../../setup";
import { createMockH3Event } from "../../../../mock/h3-event";

vi.mock("../../../../../server/controllers/getSingleSection");

useH3TestUtils();

describe("GET /api/v1/sections/:slug (slug.get)", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Arrange: import handlers
  const getSingleSectionHandler =
    await import("../../../../../server/controllers/getSingleSection");

  const sectionsSlugGetHandler =
    await import("../../../../../server/api/v1/sections/[slug].get");

  it("should call getSingleSection controller with event and returns result", async () => {
    const fakeResponse = {
      section: [{ _id: "1", title: "Section 1" }],
    };
    vi.mocked(getSingleSectionHandler.default).mockResolvedValue(fakeResponse);

    const event = createMockH3Event({});

    // Act: call sections [slug].get handler
    const result = await sectionsSlugGetHandler.default(event);

    // Assert: controller should be called with event and response returned
    expect(getSingleSectionHandler.default).toHaveBeenCalledWith(event);
    expect(result).toEqual(fakeResponse);
  });
});
