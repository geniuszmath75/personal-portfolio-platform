import { describe, expect, it } from "vitest";
import { Section } from "../../../../server/models/Section";
import { ISectionType, BlockKind } from "../../../../shared/types/enums";

describe("Section model", () => {
  /**
   * TITLE
   */
  describe("title", () => {
    it("should reject too short title", async () => {
      const section = new Section({
        title: "ab",
        slug: "test-slug",
        type: ISectionType.HERO,
        order: 1,
      });

      await expect(section.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          title: expect.objectContaining({
            message: "Title must be at least 3 character long.",
          }),
        }),
      });
    });

    it("should reject too long title", async () => {
      const longTitle = "a".repeat(65);
      const section = new Section({
        title: longTitle,
        slug: "test-slug",
        type: ISectionType.HERO,
        order: 1,
      });

      await expect(section.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          title: expect.objectContaining({
            message: "Title must be at most 64 character long.",
          }),
        }),
      });
    });
  });

  /**
   * SLUG
   */
  describe("slug", () => {
    it("should be required", async () => {
      const section = new Section({
        title: "Test title",
        type: ISectionType.HERO,
        order: 1,
      });

      await expect(section.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          slug: expect.objectContaining({ message: "Slug is required" }),
        }),
      });
    });
  });

  /**
   * TYPE
   */
  describe("type", () => {
    it("should set default type to HERO", async () => {
      const section = new Section({
        title: "Test title",
        slug: "test-slug",
        order: 1,
      });

      expect(section.type).toBe("HERO");
    });

    it("should reject invalid role", async () => {
      const section = new Section({
        title: "Test title",
        slug: "test-slug",
        order: 1,
        type: "INVALID_ROLE",
      });

      await expect(section.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          type: expect.anything(),
        }),
      });
    });
  });

  /**
   * ORDER
   */
  describe("order", () => {
    it("should be required", async () => {
      const section = new Section({
        title: "Test title",
        slug: "test-slug",
        type: ISectionType.HERO,
      });

      await expect(section.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          order: expect.objectContaining({ message: "Order is required" }),
        }),
      });
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
      it("should require 'kind' field", async () => {
        const section = new Section({
          title: "Test title",
          slug: "test-slug",
          type: ISectionType.HERO,
          order: 1,
          blocks: [{ paragraphs: ["Paragraph 1"] }],
        });

        await expect(section.validate()).rejects.toMatchObject({
          errors: expect.objectContaining({
            "blocks.0.kind": expect.objectContaining({
              message: "Base block kind is required.",
            }),
          }),
        });
      });
    });

    /**
     * PARAGRAPH BLOCK
     */
    describe("ParagraphBlock", () => {
      it("should reject empty paragraphs array", async () => {
        const section = new Section({
          title: "Test title",
          slug: "test-slug",
          type: ISectionType.HERO,
          order: 1,
          blocks: [{ kind: BlockKind.PARAGRAPH, paragraphs: [] }],
        });

        await expect(section.validate()).rejects.toMatchObject({
          errors: expect.objectContaining({
            "blocks.0.paragraphs": expect.objectContaining({
              message: "At least one paragraph is required.",
            }),
          }),
        });
      });

      it("should reject too short paragraph", async () => {
        const section = new Section({
          title: "Test title",
          slug: "test-slug",
          type: ISectionType.HERO,
          order: 1,
          blocks: [{ kind: BlockKind.PARAGRAPH, paragraphs: [""] }],
        });

        await expect(section.validate()).rejects.toMatchObject({
          errors: expect.objectContaining({
            "blocks.0.paragraphs": expect.objectContaining({
              message: "Each paragraph must be at least 1 character long.",
            }),
          }),
        });
      });
    });

    /**
     * IMAGE BLOCK
     */
    describe("ImageBlock", () => {
      it("should reject empty image array", async () => {
        const section = new Section({
          title: "Test title",
          slug: "test-slug",
          type: ISectionType.HERO,
          order: 1,
          blocks: [{ kind: BlockKind.IMAGE, images: [] }],
        });

        await expect(section.validate()).rejects.toMatchObject({
          errors: expect.objectContaining({
            "blocks.0.images": expect.objectContaining({
              message: "At least one image is required.",
            }),
          }),
        });
      });
    });

    /**
     * BUTTON BLOCK
     */
    describe("ButtonBlock", () => {
      it("should reject empty button array", async () => {
        const section = new Section({
          title: "Test title",
          slug: "test-slug",
          type: ISectionType.HERO,
          order: 1,
          blocks: [{ kind: BlockKind.BUTTON, buttons: [] }],
        });

        await expect(section.validate()).rejects.toMatchObject({
          errors: expect.objectContaining({
            "blocks.0.buttons": expect.objectContaining({
              message: "At least one button is required.",
            }),
          }),
        });
      });

      it("should reject too short button", async () => {
        const section = new Section({
          title: "Test title",
          slug: "test-slug",
          type: ISectionType.HERO,
          order: 1,
          blocks: [{ kind: BlockKind.BUTTON, buttons: [""] }],
        });

        await expect(section.validate()).rejects.toMatchObject({
          errors: expect.objectContaining({
            "blocks.0.buttons": expect.objectContaining({
              message: "Each button must be at least 1 character long.",
            }),
          }),
        });
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
        it("should reject too short header", async () => {
          const section = new Section({
            title: "Test title",
            slug: "test-slug",
            type: ISectionType.HERO,
            order: 1,
            blocks: [{ kind: BlockKind.GROUP, header: "" }],
          });

          await expect(section.validate()).rejects.toMatchObject({
            errors: expect.objectContaining({
              "blocks.0.header": expect.objectContaining({
                message:
                  "Group block header must be at least 1 character long.",
              }),
            }),
          });
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
        it("should be required", async () => {
          const section = new Section({
            title: "Test title",
            slug: "test-slug",
            type: ISectionType.HERO,
            order: 1,
            blocks: [
              { kind: BlockKind.GROUP, items: [{ label: "Icon description" }] },
            ],
          });

          await expect(section.validate()).rejects.toMatchObject({
            errors: expect.objectContaining({
              "blocks.0.items.0.icon": expect.objectContaining({
                message: "Icon is required.",
              }),
            }),
          });
        });
      });

      /**
       * LABEL
       */
      describe("label", () => {
        it("should be required", async () => {
          const section = new Section({
            title: "Test title",
            slug: "test-slug",
            type: ISectionType.HERO,
            order: 1,
            blocks: [{ kind: BlockKind.GROUP, items: [{ icon: "icon.svg" }] }],
          });

          await expect(section.validate()).rejects.toMatchObject({
            errors: expect.objectContaining({
              "blocks.0.items.0.label": expect.objectContaining({
                message: "Label is required.",
              }),
            }),
          });
        });
      });
    });
  });
});
