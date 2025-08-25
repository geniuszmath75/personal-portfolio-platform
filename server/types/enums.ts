/**
 * Represents the roles that a user can have in the system.
 */
export enum UserSchemaRole {
  ADMIN = "ADMIN",
}

/**
 * Represents the types of sections that can be created on the main page.
 */
export enum ISectionType {
  SKILLS = "SKILLS",
  HERO = "HERO",
  CONTACT = "CONTACT",
}

/**
 * Represents the kinds of blocks that can be included in a section.
 */
export enum BlockKind {
  PARAGRAPH = "PARAGRAPH",
  IMAGE = "IMAGE",
  BUTTON = "BUTTON",
  GROUP = "GROUP",
}
