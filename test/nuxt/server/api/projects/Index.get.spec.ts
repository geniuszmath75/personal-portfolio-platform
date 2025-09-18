import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "../../../../setup";
import { createMockH3Event } from "../../../../mock/h3-event";

vi.mock("../../../../../server/controllers/getAllProjects");

useH3TestUtils();

describe("GET /api/v1/projects (index.get)", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Arrange: import handlers
  const getAllProjectsHandler = await import(
    "../../../../../server/controllers/getAllProjects"
  );

  const projectsIndexGetHandler = await import(
    "../../../../../server/api/v1/projects/index.get"
  );

  it("should call getAllProjects controller with event and returns result", async () => {
    const fakeResponse = {
      projects: [
        { _id: "1", title: "Project 1", technologies: ["Vue", "Nuxt"] },
      ],
      count: 1,
    };
    vi.mocked(getAllProjectsHandler.default).mockResolvedValue(fakeResponse);

    const event = createMockH3Event({});

    // Act: call sections index.get handler
    const result = await projectsIndexGetHandler.default(event);

    // Assert: controller should be called with event and response returned
    expect(getAllProjectsHandler.default).toHaveBeenCalledWith(event);
    expect(result).toEqual(fakeResponse);
  });
});
