import { describe, expect, it } from "vitest";
import { blockSchema } from "../../../../shared/utils/validateSectionBlocks";
import { BlockKind } from "../../../../shared/types/enums";

describe("validateSectionBlocks util", () => {
  describe("valid data", () => {
    it("should validate a paragraph block", () => {
      const block = {
        kind: BlockKind.PARAGRAPH,
        paragraphs: ["Welcome to my portfolio!"],
      };

      expect(() => blockSchema.parse(block)).not.toThrow();
    });

    it("should validate an image block", () => {
      const block = {
        kind: BlockKind.IMAGE,
        images: [
          { srcPath: "/images/photo.jpg", altText: "Photo" },
          { srcPath: "/images/icon.svg", altText: "Icon" },
        ],
      };

      expect(() => blockSchema.parse(block)).not.toThrow();
    });

    it("should validate a button block", () => {
      const block = {
        kind: BlockKind.BUTTON,
        buttons: ["Contact me", "See projects"],
      };

      expect(() => blockSchema.parse(block)).not.toThrow();
    });

    it("should validate a group block", () => {
      const block = {
        kind: BlockKind.GROUP,
        header: "Skills",
        items: [
          { icon: "icon-js.svg", label: "JavaScript" },
          { icon: "icon-vue.svg", label: "Vue 3" },
        ],
      };

      expect(() => blockSchema.parse(block)).not.toThrow();
    });
  });

  describe("invalid data", () => {
    /**
     * Paragraph block
     */
    it("should reject paragraph block with empty paragraphs array", () => {
      const block = { kind: BlockKind.PARAGRAPH, paragraphs: [] };

      expect(() => blockSchema.parse(block)).toThrow();
    });

    it("should reject paragraph block with empty string paragraph", () => {
      const block = { kind: BlockKind.PARAGRAPH, paragraphs: [""] };

      expect(() => blockSchema.parse(block)).toThrow();
    });

    /**
     * Image block
     */
    it("should reject image block with empty images array", () => {
      const block = { kind: BlockKind.IMAGE, images: [] };

      expect(() => blockSchema.parse(block)).toThrow();
    });

    it("should reject image block with invalid image URL", () => {
      const block = {
        kind: BlockKind.IMAGE,
        images: [{ srcPath: "/images/file.txt", altText: "Invalid" }],
      };

      expect(() => blockSchema.parse(block)).toThrow();
    });

    it("should reject image block with too short srcPath", () => {
      const block = {
        kind: BlockKind.IMAGE,
        images: [{ srcPath: "a.png", altText: "too short" }],
      };

      expect(() => blockSchema.parse(block)).toThrow();
    });

    it("should reject image block missing altText", () => {
      const block = {
        kind: BlockKind.IMAGE,
        images: [{ srcPath: "/images/photo.png" }],
      };

      expect(() => blockSchema.parse(block)).toThrow();
    });

    it("should reject image block with empty altText", () => {
      const block = {
        kind: BlockKind.IMAGE,
        images: [{ srcPath: "/images/photo.png", altText: "" }],
      };

      expect(() => blockSchema.parse(block)).toThrow();
    });

    /**
     * Button block
     */
    it("should reject button block with empty array", () => {
      const block = { kind: BlockKind.BUTTON, buttons: [] };

      expect(() => blockSchema.parse(block)).toThrow();
    });

    it("should reject button block with empty button label", () => {
      const block = { kind: BlockKind.BUTTON, buttons: [""] };

      expect(() => blockSchema.parse(block)).toThrow();
    });

    /**
     * Group block
     */
    it("should reject group block with empty items", () => {
      const block = { kind: BlockKind.GROUP, items: [] };

      expect(() => blockSchema.parse(block)).toThrow();
    });

    it("should reject group block item missing icon or label", () => {
      const blockWithoutIcon = {
        kind: BlockKind.GROUP,
        items: [{ label: "Missing icon" }],
      };
      const blockWithoutLabel = {
        kind: BlockKind.GROUP,
        items: [{ icon: "icon.svg" }],
      };

      expect(() => blockSchema.parse(blockWithoutIcon)).toThrow();
      expect(() => blockSchema.parse(blockWithoutLabel)).toThrow();
    });
  });
});
