import { describe, expect, it } from "vitest";
import { Project } from "../../../../server/models/Project";
import type { HydratedDocument } from "mongoose";
import type { IProject } from "../../../../shared/types";

const validProjectFields = {
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
};

const getEndDateValidator = () =>
  Project.schema.path("endDate").validators[0].validator as (
    this: { get?: (key: string) => unknown },
    value?: Date,
  ) => boolean;

describe("Project model", () => {
  /**
   * TITLE
   */
  describe("title", () => {
    it("should be required", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          title: expect.objectContaining({ message: "Title is required" }),
        }),
      });
    });

    it("should reject too short title", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          title: expect.objectContaining({
            message: "Title must be at least 3 characters long.",
          }),
        }),
      });
    });

    it("should reject too long title", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          title: expect.objectContaining({
            message: "Title must be at most 32 characters long.",
          }),
        }),
      });
    });
  });

  /**
   * TECHNOLOGIES
   */
  describe("technologies", () => {
    it("should reject empty technologies array", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          technologies: expect.objectContaining({
            message: "At least one technology is required.",
          }),
        }),
      });
    });

    it("should reject too short technology name", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          technologies: expect.objectContaining({
            message: "Each technology must be at least 1 character long.",
          }),
        }),
      });
    });
  });

  /**
   * START DATE
   */
  describe("startDate", () => {
    it("should be required", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          startDate: expect.objectContaining({
            message: "Start date is required",
          }),
        }),
      });
    });
  });

  /**
   * END DATE
   */
  describe("endDate", () => {
    it("should allow empty value", async () => {
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

      await expect(project.validate()).resolves.toBeUndefined();
      expect(project.endDate).toBeUndefined();
    });

    it("should allow endDate later than startDate", async () => {
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

      await expect(project.validate()).resolves.toBeUndefined();
    });

    it("should throw validation error if endDate <= startDate", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          endDate: expect.objectContaining({
            message: "End date must be later than startDate.",
          }),
        }),
      });
    });
  });

  /**
   * END DATE VALIDATOR (query context)
   */
  describe("endDate validator", () => {
    it("should allow empty endDate regardless of context", async () => {
      const validator = getEndDateValidator();
      const queryContext = {
        get: (key: string) =>
          key === "startDate" ? new Date("2025-09-01") : undefined,
      };

      expect(validator.call(queryContext, undefined)).toBe(true);
    });

    it("should compare endDate against startDate from query context on update", () => {
      const validator = getEndDateValidator();
      const queryContext = {
        get: (key: string) =>
          key === "startDate" ? new Date("2025-09-01") : undefined,
      };

      expect(validator.call(queryContext, new Date("2025-09-02"))).toBe(true);
      expect(validator.call(queryContext, new Date("2025-08-31"))).toBe(false);
    });

    it("should skip endDate comparison when startDate is missing from query context", () => {
      const validator = getEndDateValidator();
      const queryContext = {
        get: () => undefined,
      };

      expect(validator.call(queryContext, new Date("2025-09-02"))).toBe(true);
    });

    it("should skip endDate comparison when context has no get method", () => {
      const validator = getEndDateValidator();

      expect(validator.call({}, new Date("2025-09-02"))).toBe(true);
    });

    it("should compare endDate against document startDate on save", async () => {
      const project: HydratedDocument<IProject> = new Project({
        ...validProjectFields,
        endDate: new Date("2025-09-02"),
      });

      await expect(project.validate()).resolves.toBeUndefined();
    });
  });

  /**
   * SHORT DESCRIPTION
   */
  describe("shortDescription", () => {
    it("should be required", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          shortDescription: expect.objectContaining({
            message: "Short description is required",
          }),
        }),
      });
    });

    it("should reject too long shortDescription", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          shortDescription: expect.objectContaining({
            message: "Short description must be at most 64 characters long.",
          }),
        }),
      });
    });
  });

  /**
   * LONG DESCRIPTION
   */
  describe("longDescription", () => {
    it("should be required", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          longDescription: expect.objectContaining({
            message: "Long description is required",
          }),
        }),
      });
    });

    it("should reject too short longDescription", async () => {
      const shortLongDescription = "a".repeat(63);

      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription: shortLongDescription,
        mainImage: {
          srcPath: "/images/projects/image.jpg",
          altText: "image.png",
        },
        gainedExperience: ["Experience 1"],
      });

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          longDescription: expect.objectContaining({
            message: "Long description must be at least 64 characters long.",
          }),
        }),
      });
    });

    it("should reject too long longDescription", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          longDescription: expect.objectContaining({
            message: "Long description must be at most 1024 characters long.",
          }),
        }),
      });
    });
  });

  /**
   * GITHUB LINK
   */
  describe("githubLink", () => {
    it("should accept GitHub link without www subdomain", async () => {
      const project: HydratedDocument<IProject> = new Project({
        ...validProjectFields,
        githubLink: "https://github.com/user/repo",
      });

      await expect(project.validate()).resolves.toBeUndefined();
    });

    it("should accept GitHub link with www subdomain", async () => {
      const project: HydratedDocument<IProject> = new Project({
        ...validProjectFields,
        githubLink: "https://www.github.com/user/repo",
      });

      await expect(project.validate()).resolves.toBeUndefined();
    });

    it("should reject invalid format", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          githubLink: expect.objectContaining({
            message: "GitHub link is not valid",
          }),
        }),
      });
    });

    it("should reject too long GitHub link", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          githubLink: expect.objectContaining({
            message: "GitHub link must be at most 100 characters long",
          }),
        }),
      });
    });
  });

  /**
   * PROJECT SOURCE
   */
  describe("projectSource", () => {
    it("should set default projectSource to HOBBY", async () => {
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

      await expect(project.validate()).resolves.toBeUndefined();
      expect(project.projectSource).toBe("HOBBY");
    });

    it("should reject invalid projectSource option", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          projectSource: expect.anything(),
        }),
      });
    });
  });

  /**
   * WEBSITE LINK
   */
  describe("websiteLink", () => {
    it("should reject invalid format", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          websiteLink: expect.objectContaining({
            message: "Website link is not valid",
          }),
        }),
      });
    });

    it("should reject too long website link", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          websiteLink: expect.objectContaining({
            message: "Website link must be at most 100 characters long",
          }),
        }),
      });
    });
  });

  /**
   * MAIN IMAGE
   */
  describe("mainImage", () => {
    it("should be required", async () => {
      const project: HydratedDocument<IProject> = new Project({
        title: "Test title",
        technologies: ["Vue", "Nuxt"],
        startDate: new Date("2025-09-01"),
        shortDescription: "Short description",
        longDescription:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien.",
        gainedExperience: ["Experience 1"],
      });

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          mainImage: expect.objectContaining({
            message: "Main image is required",
          }),
        }),
      });
    });
  });

  /**
   * OTHER IMAGES
   */
  describe("otherImage", () => {
    it("should allow missing otherImages field", async () => {
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

      await expect(project.validate()).resolves.toBeUndefined();
    });

    it("should allow empty array for otherImages", async () => {
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

      await expect(project.validate()).resolves.toBeUndefined();
    });

    it("should validate elements inside otherImages", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          "otherImages.0.srcPath": expect.objectContaining({
            message: "Image source path must point to a valid image file.",
          }),
        }),
      });
    });
  });

  /**
   * STATUS
   */
  describe("status", () => {
    it("should set default status to COMPLETED", async () => {
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

      await expect(project.validate()).resolves.toBeUndefined();
      expect(project.status).toBe("COMPLETED");
    });

    it("should reject invalid status", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          status: expect.anything(),
        }),
      });
    });
  });

  /**
   * GAINED EXPERIENCE
   */
  describe("gainedExperience", () => {
    it("should reject empty experience array", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          gainedExperience: expect.objectContaining({
            message: "At least one experience description is required.",
          }),
        }),
      });
    });

    it("should reject too short experience name", async () => {
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

      await expect(project.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          gainedExperience: expect.objectContaining({
            message:
              "Each experience description must be at least 1 character long.",
          }),
        }),
      });
    });
  });
});
