import { describe, expect, it } from "vitest";
import { sectionSchema } from "../../../app/utils/validateSection";
import { BlockKind, ISectionType } from "../../../shared/types/enums";

describe("validateSection util", () => {
  const baseSection = {
    _id: "123",
    slug: "hero-section",
    order: 1,
    type: ISectionType.HERO,
  };

  describe("valid data", () => {
    it("should validate a section with a paragraph block", () => {
      const section = {
        ...baseSection,
        blocks: [
          {
            kind: BlockKind.PARAGRAPH,
            paragraphs: ["Welcome to my portfolio!"],
          },
        ],
      };

      expect(() => sectionSchema.parse(section)).not.toThrow();
    });

    it("should validate a section with an image block", () => {
      const section = {
        ...baseSection,
        blocks: [
          {
            kind: BlockKind.IMAGE,
            images: [
              { srcPath: "/images/photo.jpg", altText: "Photo" },
              { srcPath: "/images/icon.svg", altText: "Icon" },
            ],
          },
        ],
      };

      expect(() => sectionSchema.parse(section)).not.toThrow();
    });

    it("should validate a section with a button block", () => {
      const section = {
        ...baseSection,
        blocks: [
          {
            kind: BlockKind.BUTTON,
            buttons: ["Contact me", "See projects"],
          },
        ],
      };

      expect(() => sectionSchema.parse(section)).not.toThrow();
    });

    it("should validate a section with a group block", () => {
      const section = {
        ...baseSection,
        blocks: [
          {
            kind: BlockKind.GROUP,
            header: "Skills",
            items: [
              { icon: "icon-js.svg", label: "JavaScript" },
              { icon: "icon-vue.svg", label: "Vue 3" },
            ],
          },
        ],
      };

      expect(() => sectionSchema.parse(section)).not.toThrow();
    });

    it("should accept nullable and optional title", () => {
      const section1 = { ...baseSection, title: null, blocks: [] };
      const section2 = { ...baseSection, blocks: [] };

      expect(() => sectionSchema.parse(section1)).not.toThrow();
      expect(() => sectionSchema.parse(section2)).not.toThrow();
    });
  });

  describe("invalid data", () => {
    it("should reject empty slug", () => {
      const section = { ...baseSection, slug: "", blocks: [] };
      expect(() => sectionSchema.parse(section)).toThrow();
    });

    it("should reject negative order", () => {
      const section = { ...baseSection, order: -1, blocks: [] };
      expect(() => sectionSchema.parse(section)).toThrow();
    });

    it("should reject invalid section type", () => {
      const section = { ...baseSection, type: "INVALID_TYPE", blocks: [] };
      expect(() => sectionSchema.parse(section)).toThrow();
    });

    /**
     * Paragraph block
     */
    it("should reject paragraph block with empty paragraphs array", () => {
      const section = {
        ...baseSection,
        blocks: [{ kind: BlockKind.PARAGRAPH, paragraphs: [] }],
      };
      expect(() => sectionSchema.parse(section)).toThrow();
    });

    it("should reject paragraph block with empty string paragraph", () => {
      const section = {
        ...baseSection,
        blocks: [{ kind: BlockKind.PARAGRAPH, paragraphs: [""] }],
      };
      expect(() => sectionSchema.parse(section)).toThrow();
    });

    /**
     * Image block
     */
    it("should reject image block with invalid image URL", () => {
      const section = {
        ...baseSection,
        blocks: [
          {
            kind: BlockKind.IMAGE,
            images: [{ srcPath: "/images/file.txt", altText: "Invalid" }],
          },
        ],
      };
      expect(() => sectionSchema.parse(section)).toThrow();
    });

    it("should reject image block with too short srcPath", () => {
      const section = {
        ...baseSection,
        blocks: [
          {
            kind: BlockKind.IMAGE,
            images: [{ srcPath: "a.png", altText: "too short" }],
          },
        ],
      };
      expect(() => sectionSchema.parse(section)).toThrow();
    });

    it("should reject image block missing altText", () => {
      const section = {
        ...baseSection,
        blocks: [
          {
            kind: BlockKind.IMAGE,
            images: [{ srcPath: "/images/photo.png" }],
          },
        ],
      };
      expect(() => sectionSchema.parse(section)).toThrow();
    });

    /**
     * Button block
     */
    it("should reject button block with empty array", () => {
      const section = {
        ...baseSection,
        blocks: [{ kind: BlockKind.BUTTON, buttons: [] }],
      };
      expect(() => sectionSchema.parse(section)).toThrow();
    });

    it("should reject button block with empty button label", () => {
      const section = {
        ...baseSection,
        blocks: [{ kind: BlockKind.BUTTON, buttons: [""] }],
      };
      expect(() => sectionSchema.parse(section)).toThrow();
    });

    /**
     * Group block
     */
    it("should reject group block with empty items", () => {
      const section = {
        ...baseSection,
        blocks: [{ kind: BlockKind.GROUP, items: [] }],
      };
      expect(() => sectionSchema.parse(section)).toThrow();
    });

    it("should reject group block item missing icon or label", () => {
      const section1 = {
        ...baseSection,
        blocks: [{ kind: BlockKind.GROUP, items: [{ label: "Missing icon" }] }],
      };
      const section2 = {
        ...baseSection,
        blocks: [{ kind: BlockKind.GROUP, items: [{ icon: "icon.svg" }] }],
      };

      expect(() => sectionSchema.parse(section1)).toThrow();
      expect(() => sectionSchema.parse(section2)).toThrow();
    });
  });
});
