import { describe, expect, it } from "vitest";
import { BlockKind } from "../../../shared/types/enums";
import { validateSectionBlockDraft } from "../../../app/utils/validateSectionBlockDraft";

describe("ValidateSectionBlockDraft", () => {
  it("should reject empty paragraph blocks", () => {
    expect(
      validateSectionBlockDraft({
        kind: BlockKind.PARAGRAPH,
        paragraphs: ["  "],
      }),
    ).toBe("At least one paragraph is required");
  });

  it("should accept valid image blocks", () => {
    expect(
      validateSectionBlockDraft({
        kind: BlockKind.IMAGE,
        images: [
          {
            srcPath: "/uploads/sections/hero.png",
            altText: "Hero image",
          },
        ],
      }),
    ).toBeNull();
  });

  it("should accept image blocks with a pending file and empty srcPath", () => {
    expect(
      validateSectionBlockDraft(
        {
          kind: BlockKind.IMAGE,
          images: [{ srcPath: "", altText: "Hero image" }],
        },
        { hasPendingImageFile: true },
      ),
    ).toBeNull();
  });

  it("should reject image blocks without srcPath or pending file", () => {
    expect(
      validateSectionBlockDraft({
        kind: BlockKind.IMAGE,
        images: [{ srcPath: "", altText: "Hero image" }],
      }),
    ).toBe("Image is required");
  });
});
