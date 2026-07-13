import { describe, expect, it } from "vitest";
import { BlockKind } from "../../../shared/types/enums";
import type { Block } from "../../../shared/types";
import { validateSectionBlockDraft } from "../../../app/utils/validateSectionBlockDraft";

describe("ValidateSectionBlockDraft", () => {
  describe("paragraph blocks", () => {
    it("should accept paragraph blocks with trimmed content", () => {
      expect(
        validateSectionBlockDraft({
          kind: BlockKind.PARAGRAPH,
          paragraphs: ["  Hello  "],
        }),
      ).toBeNull();
    });

    it("should reject empty paragraph blocks", () => {
      expect(
        validateSectionBlockDraft({
          kind: BlockKind.PARAGRAPH,
          paragraphs: ["  "],
        }),
      ).toBe("At least one paragraph is required");
    });
  });

  describe("image blocks", () => {
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

    it("should reject image blocks without alt text", () => {
      expect(
        validateSectionBlockDraft({
          kind: BlockKind.IMAGE,
          images: [{ srcPath: "/uploads/sections/hero.png", altText: "  " }],
        }),
      ).toBe("Alt text is required");
    });
  });

  describe("button blocks", () => {
    it("should accept button blocks with at least one label", () => {
      expect(
        validateSectionBlockDraft({
          kind: BlockKind.BUTTON,
          buttons: ["  PROJECTS  "],
        }),
      ).toBeNull();
    });

    it("should reject empty button blocks", () => {
      expect(
        validateSectionBlockDraft({
          kind: BlockKind.BUTTON,
          buttons: ["  "],
        }),
      ).toBe("At least one button label is required");
    });
  });

  describe("group blocks", () => {
    it("should accept group blocks with icon and label", () => {
      expect(
        validateSectionBlockDraft({
          kind: BlockKind.GROUP,
          items: [{ icon: " mdi:code ", label: " TypeScript " }],
        }),
      ).toBeNull();
    });

    it("should reject group blocks without a complete item", () => {
      expect(
        validateSectionBlockDraft({
          kind: BlockKind.GROUP,
          items: [{ icon: "mdi:code", label: "  " }],
        }),
      ).toBe("At least one group item with icon and label is required");
    });
  });

  it("should reject unsupported block types", () => {
    expect(
      validateSectionBlockDraft({
        kind: "UNKNOWN" as BlockKind,
        paragraphs: ["Hello"],
      } as Block),
    ).toBe("Unsupported block type");
  });
});
