import { BlockKind, ISectionType } from "../types/enums";
import type { Block } from "../../shared/types";

/**
 * Placement context used by section create/edit flows.
 */
export type SectionPlacement = "home" | "standalone";

/**
 * Layout keys used to resolve preview/display section layouts.
 */
export type SectionLayoutKey = "hero" | "skills" | "contact" | "aboutMe";

/**
 * Builder configuration for a single section type.
 */
export interface SectionBuilderTypeConfig {
  /**
   * Determines where the section can be created.
   */
  placement: SectionPlacement;

  /**
   * Block kinds that can be used in this section type.
   */
  allowedBlocks: BlockKind[];

  /**
   * Layout identifier used by display and preview components.
   */
  layout: SectionLayoutKey;

  /**
   * Optional per-kind limits for blocks inside this section type.
   */
  maxBlocksPerKind?: Partial<Record<BlockKind, number>>;
}

/**
 * Canonical builder config mapped by section type.
 */
export const SECTION_BUILDER_CONFIG: Record<
  ISectionType,
  SectionBuilderTypeConfig
> = {
  [ISectionType.HERO]: {
    placement: "home",
    allowedBlocks: [BlockKind.PARAGRAPH, BlockKind.IMAGE, BlockKind.BUTTON],
    layout: "hero",
    maxBlocksPerKind: {
      [BlockKind.IMAGE]: 1,
      [BlockKind.BUTTON]: 1,
      [BlockKind.PARAGRAPH]: 1,
    },
  },
  [ISectionType.SKILLS]: {
    placement: "home",
    allowedBlocks: [BlockKind.PARAGRAPH, BlockKind.GROUP],
    layout: "skills",
  },
  [ISectionType.CONTACT]: {
    placement: "home",
    allowedBlocks: [BlockKind.PARAGRAPH, BlockKind.GROUP],
    layout: "contact",
  },
  [ISectionType.ABOUT_ME]: {
    placement: "standalone",
    allowedBlocks: [BlockKind.PARAGRAPH, BlockKind.IMAGE, BlockKind.GROUP],
    layout: "aboutMe",
    maxBlocksPerKind: {
      [BlockKind.PARAGRAPH]: 1,
      [BlockKind.IMAGE]: 1,
      [BlockKind.GROUP]: 1,
    },
  },
};

/**
 * Section types available on home placement.
 */
export const HOME_SECTION_TYPES = Object.entries(SECTION_BUILDER_CONFIG)
  .filter(([, config]) => config.placement === "home")
  .map(([type]) => type as ISectionType);

/**
 * Section types available on standalone placement.
 */
export const STANDALONE_SECTION_TYPES = Object.entries(SECTION_BUILDER_CONFIG)
  .filter(([, config]) => config.placement === "standalone")
  .map(([type]) => type as ISectionType);

/**
 * Returns builder config for a section type.
 */
export function getSectionBuilderConfig(
  type: ISectionType,
): SectionBuilderTypeConfig {
  return SECTION_BUILDER_CONFIG[type];
}

/**
 * Returns section types available for the given placement context.
 */
export function getSectionTypesByPlacement(
  placement: SectionPlacement,
): ISectionType[] {
  return placement === "home" ? HOME_SECTION_TYPES : STANDALONE_SECTION_TYPES;
}

/**
 * Returns block kinds allowed for a section type.
 */
export function getAllowedBlockKinds(type: ISectionType): BlockKind[] {
  return getSectionBuilderConfig(type).allowedBlocks;
}

/**
 * Counts how many blocks of a given kind exist in the section.
 */
export function countBlocksByKind(blocks: Block[], kind: BlockKind): number {
  return blocks.filter((block) => block.kind === kind).length;
}

/**
 * Checks whether another block of the given kind can be added.
 */
export function canAddBlockKind(
  type: ISectionType,
  blocks: Block[],
  kind: BlockKind,
): boolean {
  const config = getSectionBuilderConfig(type);

  if (!config.allowedBlocks.includes(kind)) {
    return false;
  }

  const maxForKind = config.maxBlocksPerKind?.[kind];

  if (maxForKind === undefined) {
    return true;
  }

  return countBlocksByKind(blocks, kind) < maxForKind;
}

/**
 * Returns block kinds that can still be added to a section draft.
 */
export function getAddableBlockKinds(
  type: ISectionType,
  blocks: Block[],
): BlockKind[] {
  return getAllowedBlockKinds(type).filter((kind) =>
    canAddBlockKind(type, blocks, kind),
  );
}

/**
 * Whether the UI should warn when creating another home section of the same type.
 * Duplicate home section types are allowed; carousel/tabs may handle them later.
 */
export function shouldWarnDuplicateHomeSectionType(
  placement: SectionPlacement,
  existingTypes: ISectionType[],
  selectedType: ISectionType,
): boolean {
  return placement === "home" && existingTypes.includes(selectedType);
}
