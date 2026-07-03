import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "../../../../setup";
import { createMockH3Event } from "../../../../mock/h3-event";

vi.mock("../../../../../server/controllers/projects/updateProject");

useH3TestUtils();

describe("PUT /api/v1/projects/:id ([id].put)", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const updateProjectHandler =
    await import("../../../../../server/controllers/projects/updateProject");

  type UpdateProjectHandlerType = Awaited<
    ReturnType<typeof updateProjectHandler.default>
  >;

  const projectsIdPutHandler =
    await import("../../../../../server/api/v1/projects/[id].put");

  it("should call updateProject controller with event and return result", async () => {
    const fakeResponse = {
      project: { _id: "1", title: "Updated project", technologies: ["Vue"] },
    } as unknown as UpdateProjectHandlerType;
    vi.mocked(updateProjectHandler.default).mockResolvedValue(fakeResponse);

    const event = createMockH3Event({});

    const result = await projectsIdPutHandler.default(event);

    expect(updateProjectHandler.default).toHaveBeenCalledWith(event);
    expect(result).toEqual(fakeResponse);
  });
});
