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

/**
 * Represents the types of project source
 */
export enum ProjectSourceType {
  /**
   * Project created at university
   */
  UNIVERSITY = "UNIVERSITY",

  /**
   * Project created for a company (as employee)
   */
  COMPANY = "COMPANY",

  /**
   * Project created in the free time (learning new skills/technologies or improving existing ones)
   */
  HOBBY = "HOBBY",
}

/**
 * Represents the types of project status
 */
export enum ProjectStatusType {
  IN_PROGRESS = "IN PROGRESS",
  COMPLETED = "COMPLETED",
}
