import type { Model } from "mongoose";
import type { StringValue } from "ms";
import type { UserSchemaRole, ISectionType } from "./enums";

/********
 * USER
 *
 * Represents the user schema in the system.
 ********/

export interface IUser {
  /**
   * The user's email address.
   */
  email: string;

  /**
   * The user's hashed password.
   */
  password: string;

  /**
   * The user's username.
   */
  username: string;

  /**
   * The user's role in the system.
   */
  role: UserSchemaRole;

  /**
   * The user's avatar URL.
   */
  avatar?: string;
}

/**
 * Methods available on the IUser schema.
 */
export interface IUserMethods {
  /**
   * Generates a JSON Web Token (JWT) for the user.
   * @returns {string} The generated JWT.
   */
  createJWT(): string;

  /**
   * Compares a candidate password with the user's stored password.
   *
   * @param candidatePassword - The password to compare against the user's stored password.
   * @return {Promise<boolean>} A promise that resolves to true if the passwords match, false otherwise.
   */
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/********
 * SECTION
 *
 * Represents a section on main page.
 ********/

export interface ISection {
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
  blocks: (ParagraphBlock | ImageBlock | ButttonBlock | GroupBlock)[];
}

// TYPES OF SECTION BLOCKS

/**
 * Represents a block of text paragraphs in a section.
 */
export type ParagraphBlock = {
  /**
   * Contains the text paragraphs for the section.
   */
  paragraphs: string[];
};

/**
 * Represents a block of images in a section.
 */
export type ImageBlock = {
  /**
   * Contains the images names for the section.
   */
  images: string[];
};

/**
 * Represents a block of buttons in a section.
 */
export type ButttonBlock = {
  /**
   * Contains the buttons for the section.
   */
  buttons: string[];
};

/**
 * Represents a group block in a section, which can contain multiple items with
 * related information (e.g., icons and labels).
 */
export type GroupBlock = {
  /**
   * Contains the name of the group.
   */
  header?: string;

  /**
   * Contains the elements of the group.
   */
  items: GroupBlockItem[];
};

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

/********
 * MODELS
 ********/

/**
 * Represents a Mongoose model for the ISection schema.
 */
export type SectionModel = Model<ISection, object>;

/**
 * Represents a Mongoose model for the IUser schema.
 */
export type UserModel = Model<IUser, object, IUserMethods>;

/***********
 * CONFIGURATION
 *
 * Overrides the Nuxt runtime configuration variables with custom types.
 ***********/
declare module "@nuxt/schema" {
  export interface RuntimeConfig {
    jwtSecret: string;
    jwtLifetime: number | StringValue;
  }
}
