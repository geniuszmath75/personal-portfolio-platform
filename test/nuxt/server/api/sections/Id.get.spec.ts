import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "../../../../setup";
import { createMockH3Event } from "../../../../mock/h3-event";

vi.mock("../../../../../server/controllers/sections/getSingleSection");

useH3TestUtils();

describe("GET /api/v1/sections/:id ([id].get)", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getSingleSectionHandler =
    await import("../../../../../server/controllers/sections/getSingleSection");

  type GetSingleSectionHandlerType = Awaited<
    ReturnType<typeof getSingleSectionHandler.default>
  >;

  const sectionsIdGetHandler =
    await import("../../../../../server/api/v1/sections/[id].get");

  it("should call getSingleSection controller with event and return result", async () => {
    const fakeResponse = {
      section: { _id: "1", title: "Section 1", slug: "hero" },
    } as unknown as GetSingleSectionHandlerType;
    vi.mocked(getSingleSectionHandler.default).mockResolvedValue(fakeResponse);

    const event = createMockH3Event({});

    const result = await sectionsIdGetHandler.default(event);

    expect(getSingleSectionHandler.default).toHaveBeenCalledWith(event);
    expect(result).toEqual(fakeResponse);
  });
});
