import { describe, expect, it } from "vitest";
import { Project } from "../../../../server/models/Project";
import type { HydratedDocument } from "mongoose";
import type { IProject } from "../../../../shared/types";

describe("Project model", () => {
  /**
   * TITLE
   */
  describe("title", () => {
    it("should be required", () => {
      const project: HydratedDocument<IProject> = new Project({
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.title).toBeDefined();
      expect(validationError?.errors.title.message).toBe("Title is required");
    });

    it("should reject too short title", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Ab",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.title).toBeDefined();
      expect(validationError?.errors.title.message).toBe(
        "Title must be at least 3 characters long.",
      );
    });

    it("should reject too long title", () => {
      const longTitle = "a".repeat(33);
      const project: HydratedDocument<IProject> = new Project({
        title: longTitle,
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.title).toBeDefined();
      expect(validationError?.errors.title.message).toBe(
        "Title must be at most 32 characters long.",
      );
    });
  });

  /**
   * TECHNOLOGIES
   */
  describe("technologies", () => {
    it("should reject empty technologies array", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: [],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.technologies).toBeDefined();
      expect(validationError?.errors.technologies.message).toBe(
        "At least one technology is required.",
      );
    });

    it("should reject too short technology name", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["", "Vue"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.technologies).toBeDefined();
      expect(validationError?.errors.technologies.message).toBe(
        "Each technology must be at least 1 character long.",
      );
    });
  });

  /**
   * START DATE
   */
  describe("startDate", () => {
    it("should be required", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.startDate).toBeDefined();
      expect(validationError?.errors.startDate.message).toBe(
        "Start date is required",
      );
    });
  });

  /**
   * END DATE
   */
  describe("endDate", () => {
    it("should allow empty value", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError).toBeUndefined();
      expect(project.endDate).toBeUndefined();
    });

    it("should allow endDate later than startDate", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        endDate: new Date("2025-09-02"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError).toBeUndefined();
    });

    it("should throw validation error if endDate <= startDate", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        endDate: new Date("2025-08-31"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.endDate).toBeDefined();
      expect(validationError?.errors.endDate.message).toBe(
        "End date must be later than startDate.",
      );
    });
  });

  /**
   * SHORT DESCRIPTION
   */
  describe("shortDescription", () => {
    it("should be required", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.shortDescription).toBeDefined();
      expect(validationError?.errors.shortDescription.message).toBe(
        "Short description is required",
      );
    });

    it("should reject too long shortDescription", () => {
      const longShortDescription = "a".repeat(65);

      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: longShortDescription,
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.shortDescription).toBeDefined();
      expect(validationError?.errors.shortDescription.message).toBe(
        "Short description must be at most 64 characters long.",
      );
    });
  });

  /**
   * LONG DESCRIPTION
   */
  describe("longDescription", () => {
    it("should be required", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.longDescription).toBeDefined();
      expect(validationError?.errors.longDescription.message).toBe(
        "Long description is required",
      );
    });

    it("should reject too short longDescription", () => {
      const shortLongDescription = "a".repeat(63);

      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription: shortLongDescription,
        mmainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.longDescription).toBeDefined();
      expect(validationError?.errors.longDescription.message).toBe(
        "Long description must be at least 64 characters long.",
      );
    });

    it("should reject too long longDescription", () => {
      const longLongDescription = "a".repeat(1025);

      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription: longLongDescription,
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.longDescription).toBeDefined();
      expect(validationError?.errors.longDescription.message).toBe(
        "Long description must be at most 1024 characters long.",
      );
    });
  });

  /**
   * GITHUB LINK
   */
  describe("githubLink", () => {
    it("should reject invalid format", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        githubLink: "https://invalid.com/user/user1",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.githubLink).toBeDefined();
      expect(validationError?.errors.githubLink.message).toBe(
        "GitHub link is not valid",
      );
    });

    it("should reject too long GitHub link", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        githubLink:
          "https://www.github.com/user/user1/tree/feature/lorem-ipsum-dolor-sit-amet-consectetur-adipiscing-elit",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.githubLink).toBeDefined();
      expect(validationError?.errors.githubLink.message).toBe(
        "GitHub link must be at most 100 characters long",
      );
    });
  });

  /**
   * PROJECT SOURCE
   */
  describe("projectSource", () => {
    it("should set default projectSource to HOBBY", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError).toBeUndefined();
      expect(project.projectSource).toBe("HOBBY");
    });

    it("should reject invalid projectSource option", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        projectSource: "INVALID_SOURCE",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.projectSource).toBeDefined();
    });
  });

  /**
   * WEBSITE LINK
   */
  describe("websiteLink", () => {
    it("should reject invalid format", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        websiteLink: "http://www.invalid.com",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.websiteLink).toBeDefined();
      expect(validationError?.errors.websiteLink.message).toBe(
        "Website link is not valid",
      );
    });

    it("should reject too long website link", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        websiteLink:
          "https://www.invalid.com/very/very/long/path/to/some-very-very-long-resource-name-which-should-throw-error",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.websiteLink).toBeDefined();
      expect(validationError?.errors.websiteLink.message).toBe(
        "Website link must be at most 100 characters long",
      );
    });
  });

  /**
   * MAIN IMAGE
   */
  describe("mainImage", () => {
    it("should be required", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.mainImage).toBeDefined();
      expect(validationError?.errors.mainImage.message).toBe(
        "Main image is required",
      );
    });
  });

  /**
   * OTHER IMAGES
   */
  describe("otherImage", () => {
    it("should allow missing otherImages field", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.jpg",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError).toBeUndefined();
    });

    it("should allow empty array for otherImages", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.jpg",
        },
        otherImages: [],
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError).toBeUndefined();
    });

    it("should validate elements inside otherImages", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.jpg",
        },
        otherImages: [{ srcPath: "invalid.txt", altText: "Alt" }],
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors["otherImages.0.srcPath"]).toBeDefined();
      expect(validationError?.errors["otherImages.0.srcPath"].message).toBe(
        "Image source path must point to a valid image file.",
      );
    });
  });

  /**
   * STATUS
   */
  describe("status", () => {
    it("should set default status to COMPLETED", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.status).toBeUndefined();
      expect(project.status).toBe("COMPLETED");
    });

    it("should reject invalid status", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        status: "INVALID_STATUS",
        gainedExperience: ["Experience 1"],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.status).toBeDefined();
    });
  });

  /**
   * GAINED EXPERIENCE
   */
  describe("gainedExperience", () => {
    it("should reject empty experience array", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: [],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: [],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.gainedExperience).toBeDefined();
      expect(validationError?.errors.gainedExperience.message).toBe(
        "At least one experience description is required.",
      );
    });

    it("should reject too short experience name", () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["", "Vue"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: [""],
      });

      const validationError = project.validateSync();
      expect(validationError?.errors.gainedExperience).toBeDefined();
      expect(validationError?.errors.gainedExperience.message).toBe(
        "Each experience description must be at least 1 character long.",
      );
    });
  });
});
