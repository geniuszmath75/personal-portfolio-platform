import { describe, expect, it } from "vitest";
import { BlockKind } from "../../../shared/types/enums";
import {
  getSectionBlockSummary,
  SECTION_BLOCK_KIND_LABELS,
} from "../../../app/utils/sectionBlockLabels";

describe("SectionBlockLabels", () => {
  describe("SECTION_BLOCK_KIND_LABELS", () => {
    it.each([
      { kind: BlockKind.PARAGRAPH, label: "Paragraph" },
      { kind: BlockKind.IMAGE, label: "Image" },
      { kind: BlockKind.BUTTON, label: "Button" },
      { kind: BlockKind.GROUP, label: "Group" },
    ])("should expose label for $kind", ({ kind, label }) => {
      expect(SECTION_BLOCK_KIND_LABELS[kind]).toBe(label);
    });
  });

  describe("getSectionBlockSummary", () => {
    it("should return first non-empty paragraph text", () => {
      expect(
        getSectionBlockSummary({
          kind: BlockKind.PARAGRAPH,
          paragraphs: ["  ", "Hello world"],
        }),
      ).toBe("Hello world");
    });

    it("should return empty paragraph fallback", () => {
      expect(
        getSectionBlockSummary({
          kind: BlockKind.PARAGRAPH,
          paragraphs: ["", "  "],
        }),
      ).toBe("Empty paragraph");
    });

    it("should prefer image alt text over srcPath", () => {
      expect(
        getSectionBlockSummary({
          kind: BlockKind.IMAGE,
          images: [
            {
              srcPath: "/uploads/sections/hero.png",
              altText: "Hero image",
            },
          ],
        }),
      ).toBe("Hero image");
    });

    it("should fall back to image srcPath when alt text is empty", () => {
      expect(
        getSectionBlockSummary({
          kind: BlockKind.IMAGE,
          images: [{ srcPath: "/uploads/sections/hero.png", altText: "" }],
        }),
      ).toBe("/uploads/sections/hero.png");
    });

    it("should return empty image fallback", () => {
      expect(
        getSectionBlockSummary({
          kind: BlockKind.IMAGE,
          images: [{ srcPath: "", altText: "" }],
        }),
      ).toBe("Empty image");
    });

    it("should summarize button labels", () => {
      expect(
        getSectionBlockSummary({
          kind: BlockKind.BUTTON,
          buttons: ["PROJECTS", "ABOUT ME"],
        }),
      ).toBe("PROJECTS, ABOUT ME");
    });

    it("should return empty button fallback", () => {
      expect(
        getSectionBlockSummary({
          kind: BlockKind.BUTTON,
          buttons: [],
        }),
      ).toBe("Empty button");
    });

    it("should prefer group header over item labels", () => {
      expect(
        getSectionBlockSummary({
          kind: BlockKind.GROUP,
          header: "Skills",
          items: [{ icon: "mdi:code", label: "TypeScript" }],
        }),
      ).toBe("Skills");
    });

    it("should summarize group item labels when header is missing", () => {
      expect(
        getSectionBlockSummary({
          kind: BlockKind.GROUP,
          items: [
            { icon: "mdi:code", label: "TypeScript" },
            { icon: "mdi:language", label: "English" },
          ],
        }),
      ).toBe("TypeScript, English");
    });

    it("should return empty group fallback", () => {
      expect(
        getSectionBlockSummary({
          kind: BlockKind.GROUP,
          items: [],
        }),
      ).toBe("Empty group");
    });
  });
});
