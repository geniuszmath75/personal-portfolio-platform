import { beforeEach, describe, expect, it, vi } from "vitest";
import { Section } from "../../../../server/models/Section";
import { useH3TestUtils } from "../../../setup";
import { createMockH3Event } from "../../../mock/h3-event";
import { ISectionType } from "../../../../shared/types/enums";

vi.mock("../../../../server/models/Section");

useH3TestUtils();

describe("GetAllSections controller", async () => {
  const fakeSection1 = new Section({
    title: "Test title",
    slug: "test-title",
    type: ISectionType.HERO,
    order: 1,
    blocks: [
      { kind: "PARAGRAPH", paragraphs: ["Test paragraph"] },
      { kind: "IMAGE", images: ["image.jpg"] },
      { kind: "BUTTON", buttons: ["Test button"] },
      {
        kind: "GROUP",
        items: [
          {
            icon: "test.svg",
            label: "Test icon",
          },
        ],
      },
    ],
  });

  const fakeSection2 = new Section({
    title: "Test title",
    slug: "test-title",
    type: ISectionType.HERO,
    order: 2,
    blocks: [
      {
        kind: "PARAGRAPH",
        paragraphs: ["Another paragraph", "Next paragraph"],
      },
    ],
  });

  const mockSections = [fakeSection1, fakeSection2];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const handler = await import("../../../../server/api/v1/sections/index.get");

  it("should return empty array and count 0 when no sections found", async () => {
    // Arrange: mock DB to return empty list
    vi.mocked(Section.find).mockResolvedValue([]);

    const event = createMockH3Event({});

    // Act: call controller
    const result = await handler.default(event);

    // Assert: result should contain empty sections and count = 0
    expect(Section.find).toHaveBeenCalled();
    expect(result).toEqual({ sections: [], count: 0 });
  });

  it("should return array of sections with correct count", async () => {
    // Arrange: mock DB to return two fake sections
    vi.mocked(Section.find).mockResolvedValue(mockSections);

    const event = createMockH3Event({});

    // Act: call controller
    const result = await handler.default(event);

    // Transform sections to match expected JSON output
    const transformedSections = mockSections.map((section) => {
      return section.toJSON();
    });

    // Assert: result should contain mockSections and count = 2
    expect(Section.find).toHaveBeenCalled();
    expect(result).toEqual({
      sections: transformedSections,
      count: 2,
    });
  });

  it("should call Section.find with correct home section types", async () => {
    // Arrange: prepare mock to return empty list
    vi.mocked(Section.find).mockResolvedValue([]);

    const event = createMockH3Event({});

    // Act: call controller
    await handler.default(event);

    // Assert: verify Section.find called with correct types
    expect(Section.find).toHaveBeenCalledWith({
      type: {
        $in: [ISectionType.CONTACT, ISectionType.HERO, ISectionType.SKILLS],
      },
    });
  });
});
