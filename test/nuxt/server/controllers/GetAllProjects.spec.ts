import { beforeEach, describe, expect, it, vi } from "vitest";
import { Project } from "../../../../server/models/Project";
import { useH3TestUtils } from "../../../setup";
import { createMockH3Event } from "../../../mock/h3-event";
import { createMockFindChain } from "../../../mock/mongoose-find";

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

  it("should return empty array, count 0 and correct pagination when no projects found", async () => {
    // Arrange: mock DB to return empty list
    createMockFindChain([], Project);
    vi.mocked(Project.countDocuments).mockResolvedValue(0);

    const event = createMockH3Event({ query: {} });

    // Act: call controller
    const result = await handler.default(event);

    // Assert: projects empty, count=0, pagination matches defaults
    expect(Project.find).toHaveBeenCalled();
    expect(Project.countDocuments).toHaveBeenCalled();
    expect(result).toEqual({
      projects: [],
      count: 0,
      pagination: {
        page: 1,
        limit: 5,
        prevPage: null,
        nextPage: null,
        totalDocuments: 0,
        totalPages: 1,
      },
    });
  });

  it("should return array of projects with correct count and pagination", async () => {
    // Arrange: mock DB to return two fake projects
    createMockFindChain(mockProjects, Project);
    vi.mocked(Project.countDocuments).mockResolvedValue(2);

    const event = createMockH3Event({ query: { page: "1", limit: "5" } });

    // Act: call controller
    const result = await handler.default(event);

    // Assert: result contains projects, count=2 and pagination info
    expect(Project.find).toHaveBeenCalled();
    expect(Project.countDocuments).toHaveBeenCalled();
    expect(result).toEqual({
      projects: mockProjects,
      count: 2,
      pagination: {
        page: 1,
        limit: 5,
        prevPage: null,
        nextPage: null,
        totalDocuments: 2,
        totalPages: 1,
      },
    });
  });

  it("should apply pagination (skip & limit) correctly", async () => {
    // Arrange: mock DB with 10 projects, request page=2, limit=5
    const tenProjects = Array.from({ length: 5 }, () => fakeProject1);
    createMockFindChain(tenProjects, Project);
    vi.mocked(Project.countDocuments).mockResolvedValue(10);

    const event = createMockH3Event({ query: { page: "2", limit: "5" } });

    // Act: call controller
    const result = await handler.default(event);

    // Assert: pagination object reflects page 2 of 2
    expect(Project.find).toHaveBeenCalled();
    expect(Project.countDocuments).toHaveBeenCalled();
    expect(result.pagination).toEqual({
      page: 2,
      limit: 5,
      prevPage: 1,
      nextPage: null,
      totalDocuments: 10,
      totalPages: 2,
    });
  });
});
