import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "../../../../setup";
import { createMockH3Event } from "../../../../mock/h3-event";

vi.mock("../../../../../server/controllers/getSingleProject");

useH3TestUtils();

describe("GET /api/v1/projects/:id (id.get)", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Arrange: import handlers
  const getSingleProjectHandler =
    await import("../../../../../server/controllers/getSingleProject");

  type GetSingleProjectHandlerType = Awaited<
    ReturnType<typeof getSingleProjectHandler.default>
  >;

  const projectsIdGetHandler =
    await import("../../../../../server/api/v1/projects/[id].get");

  it("should call getSingleProject controller with event and returns result", async () => {
    const fakeResponse = {
      project: {
        _id: "1",
        title: "Project 1",
        technologies: ["Vue", "Nuxt"],
      },
    } as unknown as GetSingleProjectHandlerType;
    vi.mocked(getSingleProjectHandler.default).mockResolvedValue(fakeResponse);

    const event = createMockH3Event({});

    // Act: call projects [id].get handler
    const result = await projectsIdGetHandler.default(event);

    // Assert: controller should be called with event and response returned
    expect(getSingleProjectHandler.default).toHaveBeenCalledWith(event);
    expect(result).toEqual(fakeResponse);
  });
});
