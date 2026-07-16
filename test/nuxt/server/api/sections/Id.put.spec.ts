import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "~~/test/setup";
import { createMockH3Event } from "~~/test/mock/h3-event";

vi.mock("~~/server/controllers/sections/updateSection");

useH3TestUtils();

describe("PUT /api/v1/sections/:id ([id].put)", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const updateSectionHandler =
    await import("~~/server/controllers/sections/updateSection");

  type UpdateSectionHandlerType = Awaited<
    ReturnType<typeof updateSectionHandler.default>
  >;

  const sectionsIdPutHandler =
    await import("~~/server/api/v1/sections/[id].put");

  it("should call updateSection controller with event and return result", async () => {
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
    } as unknown as UpdateSectionHandlerType;
    vi.mocked(updateSectionHandler.default).mockResolvedValue(fakeResponse);

    const event = createMockH3Event({});

    const result = await sectionsIdPutHandler.default(event);

    expect(updateSectionHandler.default).toHaveBeenCalledWith(event);
    expect(result).toEqual(fakeResponse);
  });
});
