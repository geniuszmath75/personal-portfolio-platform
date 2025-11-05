import { describe, expect, it } from "vitest";
import { projectSchema } from "../../../app/utils/validateProject";
import {
  ProjectSourceType,
  ProjectStatusType,
} from "../../../shared/types/enums";

const validProject = {
  _id: "123",
  title: "My Project",
  technologies: ["TypeScript", "Vue", "Node.js"],
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  shortDescription: "Short desc",
  longDescription: "Long description of the project.",
  githubLink: "https://github.com/example/project",
  projectSource: ProjectSourceType.HOBBY,
  websiteLink: "https://example.com",
  mainImage: { srcPath: "image.png", altText: "Main image" },
  otherImages: [
    { srcPath: "img1.jpg", altText: "Alt 1" },
    { srcPath: "img2.webp", altText: "Alt 2" },
  ],
  status: ProjectStatusType.COMPLETED,
  gainedExperience: ["Experience 1"],
};

describe("validateProject util", () => {
  it("should validate a correct project", () => {
    const result = projectSchema.parse(validProject);
    expect(result.title).toBe("My Project");
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.endDate).toBeInstanceOf(Date);
  });

  it("should transform date strings into Date objects", () => {
    const result = projectSchema.parse({
      ...validProject,
      startDate: "2025-05-10",
      endDate: "2025-06-01",
    });
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.startDate.toISOString()).toContain("2025-05-10");
    expect(result.endDate?.toISOString()).toContain("2025-06-01");
  });

  it("should allow null endDate", () => {
    const result = projectSchema.parse({
      ...validProject,
      endDate: null,
    });
    expect(result.endDate).toBeNull();
  });

  it("should allow nullable githubLink and websiteLink", () => {
    const result = projectSchema.parse({
      ...validProject,
      githubLink: null,
      websiteLink: null,
    });
    expect(result.githubLink).toBeNull();
    expect(result.websiteLink).toBeNull();
  });

  it("should set default projectSource to HOBBY if missing", () => {
    const { projectSource, ...dataWithoutSource } = validProject;
    const result = projectSchema.parse(dataWithoutSource);
    expect(result.projectSource).toBe(ProjectSourceType.HOBBY);
  });

  it("should set default status to COMPLETED if missing", () => {
    const { status, ...dataWithoutStatus } = validProject;
    const result = projectSchema.parse(dataWithoutStatus);
    expect(result.status).toBe(ProjectStatusType.COMPLETED);
  });

  it("should reject invalid URLs", () => {
    expect(() =>
      projectSchema.parse({
        ...validProject,
        githubLink: "invalid_url",
      }),
    ).toThrowError(/Invalid url/i);

    expect(() =>
      projectSchema.parse({
        ...validProject,
        websiteLink: "http:/bad-link",
      }),
    ).toThrowError(/Invalid url/i);
  });

  it("should reject invalid image extensions in mainImage", () => {
    expect(() =>
      projectSchema.parse({
        ...validProject,
        mainImage: { srcPath: "file.txt", altText: "wrong" },
      }),
    ).toThrowError(/Invalid image URL/);
  });

  it("should reject invalid image extensions in otherImages", () => {
    expect(() =>
      projectSchema.parse({
        ...validProject,
        otherImages: [{ srcPath: "badfile.bmp", altText: "x" }],
      }),
    ).toThrowError(/Invalid image URL/);
  });

  it("should accept when otherImages is omitted", () => {
    const { otherImages, ...dataWithoutOther } = validProject;
    const result = projectSchema.parse(dataWithoutOther);
    expect(result.otherImages).toBeUndefined();
  });

  it("should reject invalid projectSource values", () => {
    expect(() =>
      projectSchema.parse({
        ...validProject,
        projectSource: "SCHOOL",
      }),
    ).toThrowError();
  });

  it("should reject invalid status values", () => {
    expect(() =>
      projectSchema.parse({
        ...validProject,
        status: "DONE",
      }),
    ).toThrowError();
  });

  it("should reject when technologies is not an array of strings", () => {
    expect(() =>
      projectSchema.parse({
        ...validProject,
        technologies: "Vue,Node",
      }),
    ).toThrowError();

    expect(() =>
      projectSchema.parse({
        ...validProject,
        technologies: [123],
      }),
    ).toThrowError();
  });

  it("should reject when gained experience is not an array of strings", () => {
    expect(() =>
      projectSchema.parse({
        ...validProject,
        gainedExperience: "Experience 1,Experience 2",
      }),
    ).toThrowError();

    expect(() =>
      projectSchema.parse({
        ...validProject,
        gainedExperience: [123],
      }),
    ).toThrowError();
  });

  it("should reject missing required fields", () => {
    const { title, ...rest } = validProject;
    expect(() => projectSchema.parse(rest)).toThrowError(
      /Invalid input: expected string/,
    );
  });
});
