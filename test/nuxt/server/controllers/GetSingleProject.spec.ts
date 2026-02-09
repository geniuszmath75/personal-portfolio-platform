import { beforeEach, describe, expect, it, vi } from "vitest";
import { Project } from "../../../../server/models/Project";
import { useH3TestUtils } from "../../../setup";
import { createMockH3Event } from "../../../mock/h3-event";
import mongoose, { Types } from "mongoose";

vi.mock("../../../server/models/Project");

useH3TestUtils();

describe("GetSingleProject controller", async () => {
  const mockProject = new Project({
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

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(Project, "findById");
  });

  const handler = await import("../../../../server/api/v1/projects/[id].get");

  it("should return project when id is valid and project exists", async () => {
    // Arrange: mock Project.findById, prepare event with valid id
    const validId = new Types.ObjectId();
    vi.mocked(Project.findById).mockResolvedValue(mockProject);

    const event = createMockH3Event({ params: { id: validId } });

    // Act: call handler
    const result = await handler.default(event);

    // Assert: result contains project mock
    expect(Project.findById).toHaveBeenCalledWith(validId);
    expect(result).toEqual({
      project: mockProject.toJSON(),
    });
  });

  it("should throw 400 when id is invalid", async () => {
    // Arrange: prepare event with invalid id
    const invalidId = "not-a-valid-id";
    const event = createMockH3Event({ params: { id: invalidId } });

    // Act + Assert - handler should throw 400
    await expect(handler.default(event)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid project id",
    });
  });

  it("should throw 404 when project not found", async () => {
    // Arrange: valid id, but project doesn't exist in DB
    const validId = new mongoose.Types.ObjectId().toString();
    vi.mocked(Project.findById).mockResolvedValue(null);

    const event = createMockH3Event({ params: { id: validId } });

    // Act + Assert: handler should throw 404
    await expect(handler.default(event)).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `Project with id ${validId} not found.`,
    });
  });
});
