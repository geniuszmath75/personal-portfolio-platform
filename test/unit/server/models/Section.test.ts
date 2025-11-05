import { describe, expect, it } from "vitest";
import { Section } from "../../../../server/models/Section";
import { ISectionType, BlockKind } from "../../../../shared/types/enums";

describe("Section model", () => {
  /**
   * TITLE
   */
  describe("title", () => {
    it("should be required", () => {
      const section = new Section({
        slug: "test-slug",
        type: ISectionType.HERO,
        order: 1,
      });

      const validationError = section.validateSync();
      expect(validationError?.errors.title).toBeDefined();
      expect(validationError?.errors.title.message).toBe("Title is required");
    });

    it("should reject too short title", () => {
      const section = new Section({
        title: "ab",
        slug: "test-slug",
        type: ISectionType.HERO,
        order: 1,
      });

      const validationError = section.validateSync();
      expect(validationError?.errors.title).toBeDefined();
      expect(validationError?.errors.title.message).toBe(
        "Title must be at least 3 character long.",
      );
    });

    it("should reject too long title", () => {
      const longTitle = "a".repeat(65);
      const section = new Section({
        title: longTitle,
        slug: "test-slug",
        type: ISectionType.HERO,
        order: 1,
      });

      const validationError = section.validateSync();
      expect(validationError?.errors.title).toBeDefined();
      expect(validationError?.errors.title.message).toBe(
        "Title must be at most 64 character long.",
      );
    });
  });

  /**
   * SLUG
   */
  describe("slug", () => {
    it("should be required", () => {
      const section = new Section({
        title: "Test title",
        type: ISectionType.HERO,
        order: 1,
      });

      const validationError = section.validateSync();
      expect(validationError?.errors.slug).toBeDefined();
      expect(validationError?.errors.slug.message).toBe("Slug is required");
    });
  });

  /**
   * TYPE
   */
  describe("type", () => {
    it("should set default type to HERO", () => {
      const section = new Section({
        title: "Test title",
        slug: "test-slug",
        order: 1,
      });

      expect(section.type).toBe("HERO");
    });

    it("should reject invalid role", () => {
      const section = new Section({
        title: "Test title",
        slug: "test-slug",
        order: 1,
        type: "INVALID_ROLE",
      });

      const validationError = section.validateSync();
      expect(validationError?.errors.type).toBeDefined();
    });
  });

  /**
   * ORDER
   */
  describe("order", () => {
    it("should be required", () => {
      const section = new Section({
        title: "Test title",
        slug: "test-slug",
        type: ISectionType.HERO,
      });

      const validationError = section.validateSync();
      expect(validationError?.errors.order).toBeDefined();
      expect(validationError?.errors.order.message).toBe("Order is required");
    });
  });

  /**
   * BLOCKS
   */
  describe("blocks", () => {
    /**
     * BASE BLOCK
     */
    describe("BaseBlock", () => {
      it("should require 'kind' field", () => {
        const section = new Section({
          title: "Test title",
          slug: "test-slug",
          type: ISectionType.HERO,
          order: 1,
          blocks: [{ paragraphs: ["Paragraph 1"] }],
        });

        const validationError = section.validateSync();
        expect(validationError?.errors["blocks.0.kind"]).toBeDefined();
        expect(validationError?.errors["blocks.0.kind"].message).toBe(
          "Base block kind is required.",
        );
      });
    });

    /**
     * PARAGRAPH BLOCK
     */
    describe("ParagraphBlock", () => {
      it("should reject empty paragraphs array", () => {
        const section = new Section({
          title: "Test title",
          slug: "test-slug",
          type: ISectionType.HERO,
          order: 1,
          blocks: [{ kind: BlockKind.PARAGRAPH, paragraphs: [] }],
        });

        const validationError = section.validateSync();
        expect(validationError?.errors["blocks.0.paragraphs"]).toBeDefined();
        expect(validationError?.errors["blocks.0.paragraphs"].message).toBe(
          "At least one paragraph is required.",
        );
      });

      it("should reject too short paragraph", () => {
        const section = new Section({
          title: "Test title",
          slug: "test-slug",
          type: ISectionType.HERO,
          order: 1,
          blocks: [{ kind: BlockKind.PARAGRAPH, paragraphs: [""] }],
        });

        const validationError = section.validateSync();
        expect(validationError?.errors["blocks.0.paragraphs"]).toBeDefined();
        expect(validationError?.errors["blocks.0.paragraphs"].message).toBe(
          "Each paragraph must be at least 1 character long.",
        );
      });
    });

    /**
     * IMAGE BLOCK
     */
    describe("ImageBlock", () => {
      it("should reject empty image array", () => {
        const section = new Section({
          title: "Test title",
          slug: "test-slug",
          type: ISectionType.HERO,
          order: 1,
          blocks: [{ kind: BlockKind.IMAGE, images: [] }],
        });

        const validationError = section.validateSync();
        expect(validationError?.errors["blocks.0.images"]).toBeDefined();
        expect(validationError?.errors["blocks.0.images"].message).toBe(
          "At least one image is required.",
        );
      });
    });

    /**
     * BUTTON BLOCK
     */
    describe("ButtonBlock", () => {
      it("should reject empty button array", () => {
        const section = new Section({
          title: "Test title",
          slug: "test-slug",
          type: ISectionType.HERO,
          order: 1,
          blocks: [{ kind: BlockKind.BUTTON, buttons: [] }],
        });

        const validationError = section.validateSync();
        expect(validationError?.errors["blocks.0.buttons"]).toBeDefined();
        expect(validationError?.errors["blocks.0.buttons"].message).toBe(
          "At least one button is required.",
        );
      });

      it("should reject too short button", () => {
        const section = new Section({
          title: "Test title",
          slug: "test-slug",
          type: ISectionType.HERO,
          order: 1,
          blocks: [{ kind: BlockKind.BUTTON, buttons: [""] }],
        });

        const validationError = section.validateSync();
        expect(validationError?.errors["blocks.0.buttons"]).toBeDefined();
        expect(validationError?.errors["blocks.0.buttons"].message).toBe(
          "Each button must be at least 1 character long.",
        );
      });
    });

    /**
     * GROUP BLOCK
     */
    describe("GroupBlock", () => {
      /**
       * HEADER
       */
      describe("header", () => {
        it("should reject too short header", () => {
          const section = new Section({
            title: "Test title",
            slug: "test-slug",
            type: ISectionType.HERO,
            order: 1,
            blocks: [{ kind: BlockKind.GROUP, header: "" }],
          });

          const validationError = section.validateSync();
          expect(validationError?.errors["blocks.0.header"]).toBeDefined();
          expect(validationError?.errors["blocks.0.header"].message).toBe(
            "Group block header must be at least 1 character long.",
          );
        });
      });
    });

    /**
     * GROUP BLOCK ITEM
     */
    describe("GroupBlockItem", () => {
      /**
       * ICON
       */
      describe("icon", () => {
        it("should be required", () => {
          const section = new Section({
            title: "Test title",
            slug: "test-slug",
            type: ISectionType.HERO,
            order: 1,
            blocks: [
              { kind: BlockKind.GROUP, items: [{ label: "Icon description" }] },
            ],
          });

          const validationError = section.validateSync();
          expect(
            validationError?.errors["blocks.0.items.0.icon"],
          ).toBeDefined();
          expect(validationError?.errors["blocks.0.items.0.icon"].message).toBe(
            "Icon is required.",
          );
        });
      });

      /**
       * LABEL
       */
      describe("label", () => {
        it("should be required", () => {
          const section = new Section({
            title: "Test title",
            slug: "test-slug",
            type: ISectionType.HERO,
            order: 1,
            blocks: [{ kind: BlockKind.GROUP, items: [{ icon: "icon.svg" }] }],
          });

          const validationError = section.validateSync();
          expect(
            validationError?.errors["blocks.0.items.0.label"],
          ).toBeDefined();
          expect(
            validationError?.errors["blocks.0.items.0.label"].message,
          ).toBe("Label is required.");
        });
      });
    });
  });
});
