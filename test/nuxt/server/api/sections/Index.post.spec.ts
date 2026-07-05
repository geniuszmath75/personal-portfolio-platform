import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "../../../../setup";
import { createMockH3Event } from "../../../../mock/h3-event";

vi.mock("../../../../../server/controllers/sections/createSection");

useH3TestUtils();

describe("POST /api/v1/sections (index.post)", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createSectionHandler =
    await import("../../../../../server/controllers/sections/createSection");

  type CreateSectionHandlerType = Awaited<
    ReturnType<typeof createSectionHandler.default>
  >;

  const sectionsIndexPostHandler =
    await import("../../../../../server/api/v1/sections/index.post");

  it("should call createSection controller with event and returns result", async () => {
    const fakeResponse = {
      section: {
        _id: "1",
        slug: "hero",
        title: "Hero",
        order: 1,
        type: "HERO",
        blocks: [
          {
            kind: "PARAGRAPH",
            paragraphs: ["Welcome"],
          },
        ],
      },
    } as unknown as CreateSectionHandlerType;
    vi.mocked(createSectionHandler.default).mockResolvedValue(fakeResponse);

    const event = createMockH3Event({});

    const result = await sectionsIndexPostHandler.default(event);

    expect(createSectionHandler.default).toHaveBeenCalledWith(event);
    expect(result).toEqual(fakeResponse);
  });
});
