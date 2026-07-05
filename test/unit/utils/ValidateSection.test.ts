import { describe, expect, it } from "vitest";
import { sectionSchema } from "../../../app/utils/validateSection";
import { BlockKind, ISectionType } from "../../../shared/types/enums";

describe("validateSection util", () => {
  const baseSection = {
    _id: "123",
    slug: "hero-section",
    order: 1,
    type: ISectionType.HERO,
    blocks: [
      {
        kind: BlockKind.PARAGRAPH,
        paragraphs: ["Paragraph 1"],
      },
    ],
  };

  describe("valid data", () => {
    it("should validate a valid section", () => {
      expect(() => sectionSchema.parse(baseSection)).not.toThrow();
    });

    it("should accept nullable and optional title", () => {
      const section1 = { ...baseSection, title: null };
      const section2 = { ...baseSection };

      expect(() => sectionSchema.parse(section1)).not.toThrow();
      expect(() => sectionSchema.parse(section2)).not.toThrow();
    });
  });

  describe("invalid data", () => {
    it("should reject missing _id", () => {
      const { _id: _, ...section } = baseSection;

      expect(() => sectionSchema.parse(section)).toThrow();
    });

    it("should reject empty slug", () => {
      const section = { ...baseSection, slug: "" };

      expect(() => sectionSchema.parse(section)).toThrow();
    });

    it("should reject too short slug", () => {
      const section = { ...baseSection, slug: "a" };

      expect(() => sectionSchema.parse(section)).toThrow();
    });

    it("should reject too long slug", () => {
      const section = { ...baseSection, slug: "a".repeat(51) };

      expect(() => sectionSchema.parse(section)).toThrow();
    });

    it("should reject too short title when provided", () => {
      const section = { ...baseSection, title: "ab" };

      expect(() => sectionSchema.parse(section)).toThrow();
    });

    it("should reject too long title when provided", () => {
      const section = { ...baseSection, title: "a".repeat(65) };

      expect(() => sectionSchema.parse(section)).toThrow();
    });

    it("should reject negative order", () => {
      const section = { ...baseSection, order: -1 };

      expect(() => sectionSchema.parse(section)).toThrow();
    });

    it("should reject zero order", () => {
      const section = { ...baseSection, order: 0 };

      expect(() => sectionSchema.parse(section)).toThrow();
    });

    it("should reject invalid section type", () => {
      const section = { ...baseSection, type: "INVALID_TYPE" };

      expect(() => sectionSchema.parse(section)).toThrow();
    });

    it("should reject empty blocks array", () => {
      const section = { ...baseSection, blocks: [] };

      expect(() => sectionSchema.parse(section)).toThrow();
    });
  });
});
