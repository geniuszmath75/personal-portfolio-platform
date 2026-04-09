import z from "zod";
import { ProjectSourceType, ProjectStatusType } from "../../shared/types/enums";
import { imageSchema } from "./validateImage";

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(32, "Title must be at most 32 characters long"),
  technologies: z
    .array(
      z.string().min(1, "Each technology must be at least 1 character long"),
    )
    .min(1, "At least one technology is required"),
  startDate: z.string().transform((dateStr) => new Date(dateStr)),
  endDate: z
    .string()
    .optional()
    .transform((dateStr) => (dateStr ? new Date(dateStr) : null))
    .nullish()
    .transform((val) => val || null),
  shortDescription: z
    .string()
    .min(1, "Short description is required")
    .max(64, "Short description must be at most 64 characters long"),
  longDescription: z
    .string()
    .min(64, "Long description must be at least 64 characters long")
    .max(1024, "Long description must be at most 1024 characters long"),
  githubLink: z
    .url("GitHub link must be a valid URL")
    .startsWith("https://", { message: "GitHub link must use HTTPS" })
    .includes("github.com", {
      message: "GitHub link must point to github.com",
    })
    .max(100, "GitHub link must be at most 100 characters long")
    .optional()
    .nullish()
    .transform((val) => val || null),
  projectSource: z.enum(ProjectSourceType).default(ProjectSourceType.HOBBY),
  websiteLink: z
    .url("Website link must be a valid URL")
    .startsWith("https://", { message: "Website link must use HTTPS" })
    .max(100, "Website link must be at most 100 characters long")
    .optional()
    .nullish()
    .transform((val) => val || null),
  mainImage: imageSchema,
  otherImages: z.array(imageSchema).optional(),
  status: z.enum(ProjectStatusType).default(ProjectStatusType.COMPLETED),
  gainedExperience: z
    .array(
      z
        .string()
        .min(
          1,
          "Each experience description must be at least 1 character long",
        ),
    )
    .min(1, "At least one experience description is required"),
});

export type ValidatedCreateProject = z.infer<typeof createProjectSchema>;
