import type {
  ISectionType,
  BlockKind,
  ProjectSourceType,
  ProjectStatusType,
} from "./enums";

/**
 * Represents the image properties
 */

export interface Image {
  /**
   * Path to image source file
   */
  srcPath: string;

  /**
   * Alternative text describing the image
   */
  altText: string;
}

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

/********
 * PROJECT
 *
 * Represents a project in /projects page.
 ********/

export interface IProject {
  /**
   * The unique identifier for the project
   */
  _id: string;

  /**
   * The title of the project
   */
  title: string;

  /**
   * The list of technologies used in the project
   */
  technologies: string[];

  /**
   * The project start date
   */
  startDate: Date;

  /**
   * The project finish date
   */
  endDate?: Date;

  /**
   * The short decription of the project
   */
  shortDescription: string;

  /**
   * The long description of the project
   */
  longDescription: string;

  /**
   * The link to the project repo on GitHub
   */
  githubLink?: string | null;

  /**
   * The source of the project (the purpose of )
   */
  projectSource: ProjectSourceType;

  /**
   * The link to the project website
   */
  websiteLink?: string | null;

  /**
   * The main image of the project
   */
  mainImage: Image;

  /**
   * List of other images of the project (showing other project aspects)
   */
  otherImages?: Image[];

  /**
   * The status of the project
   */
  status: ProjectStatusType;
}
