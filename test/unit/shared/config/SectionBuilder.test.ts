import { describe, expect, it } from "vitest";
import { BlockKind, ISectionType } from "../../../../shared/types/enums";
import {
  canAddBlockKind,
  getAddableBlockKinds,
  getAllowedBlockKinds,
  getSectionBuilderConfig,
  getSectionTypesByPlacement,
  HOME_SECTION_TYPES,
  SECTION_BUILDER_CONFIG,
  shouldWarnDuplicateHomeSectionType,
  STANDALONE_SECTION_TYPES,
} from "../../../../shared/config/sectionBuilder";

describe("sectionBuilder config", () => {
  describe("SECTION_BUILDER_CONFIG", () => {
    it("should define config for every section type", () => {
      expect(Object.keys(SECTION_BUILDER_CONFIG).sort()).toEqual(
        Object.values(ISectionType).sort(),
      );
    });

    it("should map home types to hero, skills and contact layouts", () => {
      expect(getSectionBuilderConfig(ISectionType.HERO).layout).toBe("hero");
      expect(getSectionBuilderConfig(ISectionType.SKILLS).layout).toBe(
        "skills",
      );
      expect(getSectionBuilderConfig(ISectionType.CONTACT).layout).toBe(
        "contact",
      );
    });

    it("should map about me to standalone placement", () => {
      expect(getSectionBuilderConfig(ISectionType.ABOUT_ME)).toEqual({
        placement: "standalone",
        allowedBlocks: [BlockKind.PARAGRAPH, BlockKind.IMAGE, BlockKind.GROUP],
        layout: "aboutMe",
        maxBlocksPerKind: {
          [BlockKind.PARAGRAPH]: 1,
          [BlockKind.IMAGE]: 1,
          [BlockKind.GROUP]: 1,
        },
      });
    });
  });

  describe("getSectionTypesByPlacement", () => {
    it("should return home section types", () => {
      expect(getSectionTypesByPlacement("home")).toEqual(HOME_SECTION_TYPES);
      expect(getSectionTypesByPlacement("home")).toEqual([
        ISectionType.HERO,
        ISectionType.SKILLS,
        ISectionType.CONTACT,
      ]);
    });

    it("should return standalone section types", () => {
      expect(getSectionTypesByPlacement("standalone")).toEqual(
        STANDALONE_SECTION_TYPES,
      );
      expect(getSectionTypesByPlacement("standalone")).toEqual([
        ISectionType.ABOUT_ME,
      ]);
    });
  });

  describe("getAllowedBlockKinds", () => {
    it("should return hero block kinds", () => {
      expect(getAllowedBlockKinds(ISectionType.HERO)).toEqual([
        BlockKind.PARAGRAPH,
        BlockKind.IMAGE,
        BlockKind.BUTTON,
      ]);
    });
  });

  describe("canAddBlockKind", () => {
    it("should reject block kinds not allowed for the section type", () => {
      expect(canAddBlockKind(ISectionType.HERO, [], BlockKind.GROUP)).toBe(
        false,
      );
    });

    it("should allow unlimited paragraph blocks for skills sections", () => {
      const blocks = [
        { kind: BlockKind.PARAGRAPH, paragraphs: ["One"] },
        { kind: BlockKind.PARAGRAPH, paragraphs: ["Two"] },
      ];

      expect(
        canAddBlockKind(ISectionType.SKILLS, blocks, BlockKind.PARAGRAPH),
      ).toBe(true);
    });

    it("should enforce max image and button blocks for hero sections", () => {
      const blocks = [
        {
          kind: BlockKind.IMAGE,
          images: [{ srcPath: "/uploads/sections/hero.png", altText: "Hero" }],
        },
        { kind: BlockKind.BUTTON, buttons: ["PROJECTS"] },
      ];

      expect(canAddBlockKind(ISectionType.HERO, blocks, BlockKind.IMAGE)).toBe(
        false,
      );
      expect(canAddBlockKind(ISectionType.HERO, blocks, BlockKind.BUTTON)).toBe(
        false,
      );
      expect(
        canAddBlockKind(ISectionType.HERO, blocks, BlockKind.PARAGRAPH),
      ).toBe(true);
    });

    it("should enforce single-block limits for about me sections", () => {
      const blocks = [
        { kind: BlockKind.GROUP, items: [{ icon: "mdi:tag", label: "Tag" }] },
      ];

      expect(
        canAddBlockKind(ISectionType.ABOUT_ME, blocks, BlockKind.GROUP),
      ).toBe(false);
      expect(
        canAddBlockKind(ISectionType.ABOUT_ME, blocks, BlockKind.PARAGRAPH),
      ).toBe(true);
    });
  });

  describe("getAddableBlockKinds", () => {
    it("should return only block kinds that can still be added", () => {
      const blocks = [
        {
          kind: BlockKind.IMAGE,
          images: [{ srcPath: "/uploads/sections/hero.png", altText: "Hero" }],
        },
      ];

      expect(getAddableBlockKinds(ISectionType.HERO, blocks)).toEqual([
        BlockKind.PARAGRAPH,
        BlockKind.BUTTON,
      ]);
    });
  });

  describe("shouldWarnDuplicateHomeSectionType", () => {
    it("should warn when adding a duplicate home section type", () => {
      expect(
        shouldWarnDuplicateHomeSectionType(
          "home",
          [ISectionType.HERO, ISectionType.SKILLS],
          ISectionType.HERO,
        ),
      ).toBe(true);
    });

    it("should not warn for standalone placement", () => {
      expect(
        shouldWarnDuplicateHomeSectionType(
          "standalone",
          [ISectionType.ABOUT_ME],
          ISectionType.ABOUT_ME,
        ),
      ).toBe(false);
    });

    it("should not warn when the home section type is new", () => {
      expect(
        shouldWarnDuplicateHomeSectionType(
          "home",
          [ISectionType.HERO],
          ISectionType.CONTACT,
        ),
      ).toBe(false);
    });
  });
});
