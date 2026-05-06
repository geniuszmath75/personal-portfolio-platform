import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "~~/test/setup";
import { createMockH3Event } from "~~/test/mock/h3-event";

vi.mock("~~/server/controllers/projects/createProject");

useH3TestUtils();

describe("POST /api/v1/projects (index.post)", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Arrange: import handlers
  const createProjectHandler =
    await import("~~/server/controllers/projects/createProject");

  type CreateProjectHandlerType = Awaited<
    ReturnType<typeof createProjectHandler.default>
  >;

  const projectsIndexPostHandler =
    await import("~~/server/api/v1/projects/index.post");

  it("should call createProject controller with event and returns result", async () => {
    const fakeResponse = {
      project: { _id: "1", title: "Project 1", technologies: ["Vue", "Nuxt"] },
    } as unknown as CreateProjectHandlerType;
    vi.mocked(createProjectHandler.default).mockResolvedValue(fakeResponse);

    const event = createMockH3Event({});

    // Act: call sections index.post handler
    const result = await projectsIndexPostHandler.default(event);

    // Assert: controller should be called with event and response returned
    expect(createProjectHandler.default).toHaveBeenCalledWith(event);
    expect(result).toEqual(fakeResponse);
  });
});
