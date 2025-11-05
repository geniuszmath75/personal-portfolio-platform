import { beforeEach, describe, expect, it, vi } from "vitest";
import { Section } from "../../../../server/models/Section";
import { useH3TestUtils } from "../../../setup";
import { createMockH3Event } from "../../../mock/h3-event";

vi.mock("../../../server/models/Section");

useH3TestUtils();

describe("GetSingleSection controller", async () => {
  const mockSection = new Section({
    title: "About Me",
    slug: "about-me",
    order: 4,
    blocks: [
      {
        paragraphs: ["About me paragraph 1."],
        kind: "PARAGRAPH",
      },
      {
        items: [
          {
            icon: "mdi:education",
            label: "Computer Science",
          },
        ],
        kind: "GROUP",
      },
    ],
    type: "ABOUT_ME",
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Section, "findOne");
  });

  const handler = await import("../../../../server/api/v1/sections/[slug].get");

  it("should return section when slug is valid and section exists", async () => {
    // Arrange: mock Section.findById, prepare event with valid slug
    const validSlug = "about-me";
    mockSection.slug = validSlug;
    vi.mocked(Section.findOne).mockResolvedValue(mockSection);

    const event = createMockH3Event({ params: { slug: validSlug } });

    // Act: call handler
    const result = await handler.default(event);

    // Assert: result contains section mock
    expect(Section.findOne).toHaveBeenCalledWith({ slug: validSlug });
    expect(result).toEqual({
      section: mockSection,
    });
  });

  it("should throw 400 when slug is invalid", async () => {
    // Arrange: prepare event with invalid slug
    const invalidSlug = "   ";
    const event = createMockH3Event({ params: { slug: invalidSlug } });

    // Act + Assert - handler should throw 400
    await expect(handler.default(event)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid section slug",
    });
  });

  it("should throw 404 when section not found", async () => {
    // Arrange: valid slug, but section doesn't exist in DB
    const validSlug = "non-existent-slug";
    vi.mocked(Section.findOne).mockResolvedValue(null);

    const event = createMockH3Event({ params: { slug: validSlug } });

    // Act + Assert: handler should throw 404
    await expect(handler.default(event)).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `Section with slug '${validSlug}' not found.`,
    });
  });
});
