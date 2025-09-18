import { beforeEach, describe, expect, it, vi } from "vitest";
import { Project } from "../../../../server/models/Project";
import { useH3TestUtils } from "../../../setup";
import { createMockH3Event } from "../../../mock/h3-event";

vi.mock("../../../../server/models/Project");

useH3TestUtils();

describe("GetAllProjects controller", async () => {
  const fakeProject1 = new Project({
    title: "Test title",
    technologies: ["Tech1", "Tech2"],
    startDate: new Date("2025-09-01"),
    shortDescription: "Short",
    longDescription:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
    mainImage: {
      srcPath: "/images/projects/image.jpg",
      altText: "image.jpg",
    },
  });

  const fakeProject2 = new Project({
    title: "Test2 title",
    technologies: ["Tech3", "Tech4"],
    startDate: new Date("2025-09-01"),
    shortDescription: "Short desc",
    longDescription:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
    mainImage: {
      srcPath: "/images/projects/image2.jpg",
      altText: "image2.jpg",
    },
  });

  const mockProjects = [fakeProject1, fakeProject2];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const handler = await import("../../../../server/api/v1/projects/index.get");

  it("should return empty array and count 0 when no projects found", async () => {
    // Arrange: mock DB to return empty list
    vi.mocked(Project.find).mockResolvedValue([]);

    const event = createMockH3Event({});

    // Act: call controller
    const result = await handler.default(event);

    // Assert: result should contain empty projects and count = 0
    expect(Project.find).toHaveBeenCalled();
    expect(result).toEqual({ projects: [], count: 0 });
  });

  it("should return array of projects with correct count", async () => {
    // Arrange: mock DB to return two fake projects
    vi.mocked(Project.find).mockResolvedValue(mockProjects);

    const event = createMockH3Event({});

    // Act: call controller
    const result = await handler.default(event);

    // Assert: result should contain mockProjects and count = 2
    expect(Project.find).toHaveBeenCalled();
    expect(result).toEqual({
      projects: mockProjects,
      count: 2,
    });
  });
});
