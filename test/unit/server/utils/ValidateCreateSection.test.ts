import { describe, expect, it } from "vitest";
import { BlockKind, ISectionType } from "../../../../shared/types/enums";
import { createSectionSchema } from "../../../../server/utils/validateCreateSection";

describe("validateCreateSection util", () => {
  const validSectionData = {
    title: "Hero Section",
    slug: "hero",
    type: ISectionType.HERO,
    order: 1,
    blocks: [
      {
        kind: BlockKind.PARAGRAPH,
        paragraphs: ["Welcome to my portfolio"],
      },
    ],
  };

  describe("title validation", () => {
    it("should accept valid title with minimum length", () => {
      const result = createSectionSchema.parse({
        ...validSectionData,
        title: "Her",
      });

      expect(result.title).toBe("Her");
    });

    it("should accept valid title with maximum length", () => {
      const title = "A".repeat(64);
      const result = createSectionSchema.parse({
        ...validSectionData,
        title,
      });

      expect(result.title).toBe(title);
    });

    it("should accept missing title", () => {
      const result = createSectionSchema.parse({
        ...validSectionData,
        title: undefined,
      });

      expect(result.title).toBeUndefined();
    });

    it("should accept null title", () => {
      const result = createSectionSchema.parse({
        ...validSectionData,
        title: null,
      });

      expect(result.title).toBeNull();
    });

    it("should reject title with less than 3 characters", () => {
      expect(() =>
        createSectionSchema.parse({
          ...validSectionData,
          title: "ab",
        }),
      ).toThrow();
    });

    it("should reject title with more than 64 characters", () => {
      expect(() =>
        createSectionSchema.parse({
          ...validSectionData,
          title: "a".repeat(65),
        }),
      ).toThrow();
    });
  });

  describe("slug validation", () => {
    it("should accept valid slug with minimum length", () => {
      const result = createSectionSchema.parse({
        ...validSectionData,
        slug: "he",
      });

      expect(result.slug).toBe("he");
    });

    it("should accept valid slug with maximum length", () => {
      const slug = "a".repeat(50);
      const result = createSectionSchema.parse({
        ...validSectionData,
        slug,
      });

      expect(result.slug).toBe(slug);
    });

    it("should reject slug with less than 2 characters", () => {
      expect(() =>
        createSectionSchema.parse({
          ...validSectionData,
          slug: "a",
        }),
      ).toThrow();
    });

    it("should reject slug with more than 50 characters", () => {
      expect(() =>
        createSectionSchema.parse({
          ...validSectionData,
          slug: "a".repeat(51),
        }),
      ).toThrow();
    });
  });

  describe("type validation", () => {
    it("should accept valid section type", () => {
      const result = createSectionSchema.parse({
        ...validSectionData,
        type: ISectionType.SKILLS,
      });

      expect(result.type).toBe(ISectionType.SKILLS);
    });

    it("should use HERO as default type", () => {
      const result = createSectionSchema.parse({
        ...validSectionData,
        type: undefined,
      });

      expect(result.type).toBe(ISectionType.HERO);
    });

    it("should reject invalid section type", () => {
      expect(() =>
        createSectionSchema.parse({
          ...validSectionData,
          type: "INVALID_TYPE",
        }),
      ).toThrow();
    });
  });

  describe("order validation", () => {
    it("should accept positive integer order", () => {
      const result = createSectionSchema.parse({
        ...validSectionData,
        order: 5,
      });

      expect(result.order).toBe(5);
    });

    it("should reject zero order", () => {
      expect(() =>
        createSectionSchema.parse({
          ...validSectionData,
          order: 0,
        }),
      ).toThrow();
    });

    it("should reject negative order", () => {
      expect(() =>
        createSectionSchema.parse({
          ...validSectionData,
          order: -1,
        }),
      ).toThrow();
    });
  });

  describe("blocks validation", () => {
    it("should accept valid blocks array", () => {
      const result = createSectionSchema.parse(validSectionData);

      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].kind).toBe(BlockKind.PARAGRAPH);
    });

    it("should reject empty blocks array", () => {
      expect(() =>
        createSectionSchema.parse({
          ...validSectionData,
          blocks: [],
        }),
      ).toThrow();
    });

    it("should reject invalid block data", () => {
      expect(() =>
        createSectionSchema.parse({
          ...validSectionData,
          blocks: [{ kind: BlockKind.PARAGRAPH, paragraphs: [] }],
        }),
      ).toThrow();
    });
  });

  describe("complete validation", () => {
    it("should accept complete valid section data", () => {
      const result = createSectionSchema.parse(validSectionData);

      expect(result).toBeDefined();
      expect(result.slug).toBe(validSectionData.slug);
      expect(result.order).toBe(validSectionData.order);
      expect(result.blocks).toEqual(validSectionData.blocks);
    });
  });
});
