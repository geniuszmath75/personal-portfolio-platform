import {
  ProjectSourceType,
  ProjectStatusType,
} from "../../../../shared/types/enums";
import { createProjectSchema } from "../../../../server/utils/validateCreateProject";
import { describe, it, expect } from "vitest";

describe("validateCreateProject util", () => {
  const validImageData = {
    srcPath: "image.png",
    altText: "Test image",
  };

  const validProjectData = {
    title: "My Project",
    technologies: ["Vue", "TypeScript"],
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    shortDescription: "A short description",
    longDescription:
      "This is a long description that contains enough characters to pass validation requirements for the project",
    githubLink: "https://github.com/user/project",
    projectSource: ProjectSourceType.HOBBY,
    websiteLink: "https://example.com",
    mainImage: validImageData,
    otherImages: [validImageData],
    status: ProjectStatusType.COMPLETED,
    gainedExperience: ["Learned Vue 3", "TypeScript skills"],
  };

  describe("title validation", () => {
    it("should accept valid title with minimum length", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        title: "Pro",
      });
      expect(result.title).toBe("Pro");
    });

    it("should accept valid title with maximum length", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        title: "A".repeat(32),
      });
      expect(result.title).toBe("A".repeat(32));
    });

    it("should reject title with less than 3 characters", () => {
      expect(() =>
        createProjectSchema.parse({
          ...validProjectData,
          title: "AB",
        }),
      ).toThrow();
    });
  });

  describe("technologies validation", () => {
    it("should accept valid array with one technology", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        technologies: ["Vue"],
      });
      expect(result.technologies).toEqual(["Vue"]);
    });

    it("should accept valid array with multiple technologies", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        technologies: ["Vue", "TypeScript", "Node.js"],
      });
      expect(result.technologies.length).toBe(3);
    });

    it("should reject empty technologies array", () => {
      expect(() =>
        createProjectSchema.parse({
          ...validProjectData,
          technologies: [],
        }),
      ).toThrow();
    });
  });

  describe("startDate validation", () => {
    it("should transform valid date string to Date object", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        startDate: "2025-06-15",
      });
      expect(result.startDate).toBeInstanceOf(Date);
    });
  });

  describe("endDate validation", () => {
    it("should accept undefined endDate", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        endDate: undefined,
      });
      expect(result.endDate).toBeNull();
    });

    it("should transform valid endDate string to Date object", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        endDate: "2025-12-31",
      });
      expect(result.endDate).toBeInstanceOf(Date);
    });
  });

  describe("shortDescription validation", () => {
    it("should accept valid short description with minimum length", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        shortDescription: "A",
      });
      expect(result.shortDescription).toBe("A");
    });

    it("should accept short description at maximum length", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        shortDescription: "A".repeat(64),
      });
      expect(result.shortDescription).toBe("A".repeat(64));
    });

    it("should reject empty short description", () => {
      expect(() =>
        createProjectSchema.parse({
          ...validProjectData,
          shortDescription: "",
        }),
      ).toThrow();
    });
  });

  describe("longDescription validation", () => {
    it("should accept long description at minimum length", () => {
      const minLongDesc = "A".repeat(64);
      const result = createProjectSchema.parse({
        ...validProjectData,
        longDescription: minLongDesc,
      });
      expect(result.longDescription).toBe(minLongDesc);
    });

    it("should accept long description at maximum length", () => {
      const maxLongDesc = "A".repeat(1024);
      const result = createProjectSchema.parse({
        ...validProjectData,
        longDescription: maxLongDesc,
      });
      expect(result.longDescription).toBe(maxLongDesc);
    });

    it("should reject long description shorter than 64 characters", () => {
      expect(() =>
        createProjectSchema.parse({
          ...validProjectData,
          longDescription: "Too short",
        }),
      ).toThrow();
    });
  });

  describe("githubLink validation", () => {
    it("should accept valid GitHub HTTPS URL", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        githubLink: "https://github.com/user/repo",
      });
      expect(result.githubLink).toBe("https://github.com/user/repo");
    });

    it("should accept undefined githubLink", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        githubLink: undefined,
      });
      expect(result.githubLink).toBeNull();
    });

    it("should reject GitHub link with HTTP instead of HTTPS", () => {
      expect(() =>
        createProjectSchema.parse({
          ...validProjectData,
          githubLink: "http://github.com/user/repo",
        }),
      ).toThrow();
    });

    it("should reject GitHub link not pointing to github.com", () => {
      expect(() =>
        createProjectSchema.parse({
          ...validProjectData,
          githubLink: "https://gitlab.com/user/repo",
        }),
      ).toThrow();
    });

    it("should reject invalid URL format for githubLink", () => {
      expect(() =>
        createProjectSchema.parse({
          ...validProjectData,
          githubLink: "not-a-valid-url",
        }),
      ).toThrow();
    });
  });

  describe("projectSource validation", () => {
    it("should accept valid projectSource enum value", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        projectSource: ProjectSourceType.COMPANY,
      });
      expect(result.projectSource).toBe(ProjectSourceType.COMPANY);
    });

    it("should use HOBBY as default projectSource", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        projectSource: undefined,
      });
      expect(result.projectSource).toBe(ProjectSourceType.HOBBY);
    });
  });

  describe("websiteLink validation", () => {
    it("should accept valid website HTTPS URL", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        websiteLink: "https://example.com",
      });
      expect(result.websiteLink).toBe("https://example.com");
    });

    it("should accept undefined websiteLink", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        websiteLink: undefined,
      });
      expect(result.websiteLink).toBeNull();
    });

    it("should reject website link with HTTP instead of HTTPS", () => {
      expect(() =>
        createProjectSchema.parse({
          ...validProjectData,
          websiteLink: "http://example.com",
        }),
      ).toThrow();
    });

    it("should reject invalid URL format for websiteLink", () => {
      expect(() =>
        createProjectSchema.parse({
          ...validProjectData,
          websiteLink: "not-a-url",
        }),
      ).toThrow();
    });
  });

  describe("mainImage validation", () => {
    it("should accept valid mainImage object", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        mainImage: { srcPath: "main.png", altText: "Main image" },
      });
      expect(result.mainImage.srcPath).toBe("main.png");
      expect(result.mainImage.altText).toBe("Main image");
    });

    it("should reject mainImage with invalid file extension", () => {
      expect(() =>
        createProjectSchema.parse({
          ...validProjectData,
          mainImage: { srcPath: "file.pdf", altText: "Alt text" },
        }),
      ).toThrow();
    });
  });

  describe("otherImages validation", () => {
    it("should accept valid otherImages array", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        otherImages: [
          { srcPath: "img1.jpg", altText: "Image 1" },
          { srcPath: "img2.png", altText: "Image 2" },
        ],
      });
      expect(result.otherImages?.length).toBe(2);
    });

    it("should accept undefined otherImages", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        otherImages: undefined,
      });
      expect(result.otherImages).toBeUndefined();
    });
  });

  describe("status validation", () => {
    it("should accept valid status enum value", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        status: ProjectStatusType.IN_PROGRESS,
      });
      expect(result.status).toBe(ProjectStatusType.IN_PROGRESS);
    });

    it("should use COMPLETED as default status", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        status: undefined,
      });
      expect(result.status).toBe(ProjectStatusType.COMPLETED);
    });
  });

  describe("gainedExperience validation", () => {
    it("should accept valid gainedExperience array with single item", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        gainedExperience: ["Learned new skill"],
      });
      expect(result.gainedExperience.length).toBe(1);
    });

    it("should accept valid gainedExperience array with multiple items", () => {
      const result = createProjectSchema.parse({
        ...validProjectData,
        gainedExperience: ["Skill 1", "Skill 2", "Skill 3"],
      });
      expect(result.gainedExperience.length).toBe(3);
    });

    it("should reject empty gainedExperience array", () => {
      expect(() =>
        createProjectSchema.parse({
          ...validProjectData,
          gainedExperience: [],
        }),
      ).toThrow();
    });
  });

  describe("complete validation", () => {
    it("should accept complete valid project data", () => {
      const result = createProjectSchema.parse(validProjectData);
      expect(result).toBeDefined();
      expect(result.title).toBe(validProjectData.title);
      expect(result.technologies).toEqual(validProjectData.technologies);
      expect(result.startDate).toBeInstanceOf(Date);
    });
  });
});
