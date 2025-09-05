import type { ISectionType, BlockKind } from "./enums";

/********
 * SECTION
 *
 * Represents a section on main page.
 ********/

export interface ISection {
  /**
   * The unique identifier for the section.
   */
  _id: string;

  /**
   * The title of the section.
   */
  title?: string | null;

  /**
   * The slug for the section, used for routing or identification.
   */
  slug: string;

  /**
   * The type of the section, which determines its content and layout.
   */
  type: ISectionType;

  /**
   * The order of the section in the main page.
   */
  order: number;

  /**
   * Contains the blocks of the various elements that make up the section.
   */
  blocks: Block[];
}

// TYPES OF SECTION BLOCKS

/**
 * Represents all possible block types that can be included in a section.
 */
export type Block = ParagraphBlock | ImageBlock | ButttonBlock | GroupBlock;

/**
 * Base interface for all block types
 */
export interface BaseBlock {
  /**
   * The kind of block, which determines its structure and content.
   */
  kind: BlockKind;
}

/**
 * Represents a block of text paragraphs in a section.
 */
export interface ParagraphBlock extends BaseBlock {
  kind: BlockKind.PARAGRAPH;
  /**
   * Contains the text paragraphs for the section.
   */
  paragraphs: string[];
}

/**
 * Represents a block of images in a section.
 */
export interface ImageBlock extends BaseBlock {
  kind: BlockKind.IMAGE;
  /**
   * Contains the images names for the section.
   */
  images: string[];
}

/**
 * Represents a block of buttons in a section.
 */
export interface ButttonBlock extends BaseBlock {
  kind: BlockKind.BUTTON;
  /**
   * Contains the buttons for the section.
   */
  buttons: string[];
}

/**
 * Represents a group block in a section, which can contain multiple items with
 * related information (e.g., icons and labels).
 */
export interface GroupBlock extends BaseBlock {
  kind: BlockKind.GROUP;
  /**
   * Contains the name of the group.
   */
  header?: string;

  /**
   * Contains the elements of the group.
   */
  items: GroupBlockItem[];
}

/**
 * Represents an item in a group block, which includes an icon and a label.
 */
export type GroupBlockItem = {
  /**
   * Contains the icon for the group item.
   */
  icon: string;

  /**
   * Contains the name of the group item.
   */
  label: string;
};

/**
 * Response format for list of Section objects from the API.
 */
export interface SectionsResponse {
  sections: ISection[];
}
