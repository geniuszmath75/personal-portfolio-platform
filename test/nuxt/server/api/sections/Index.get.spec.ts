import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "../../../../setup";
import { createMockH3Event } from "../../../../mock/h3-event";

vi.mock("../../../../../server/controllers/getAllSections");

useH3TestUtils();

describe("GET /api/v1/sections (index.get)", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Arrange: import handlers
  const getAllSectionsHandler = await import(
    "../../../../../server/controllers/getAllSections"
  );

  const sectionsIndexGetHandler = await import(
    "../../../../../server/api/v1/sections/index.get"
  );

  it("should call getAllSections controller with event and returns result", async () => {
    const fakeResponse = {
      sections: [{ _id: "1", title: "Section 1" }],
      count: 1,
    };
    vi.mocked(getAllSectionsHandler.default).mockResolvedValue(fakeResponse);

    const event = createMockH3Event({});

    // Act: call sections index.get handler
    const result = await sectionsIndexGetHandler.default(event);

    // Assert: controller should be called with event and response returned
    expect(getAllSectionsHandler.default).toHaveBeenCalledWith(event);
    expect(result).toEqual(fakeResponse);
  });
});
