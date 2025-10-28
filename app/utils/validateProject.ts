import { z } from "zod";
import { ProjectSourceType, ProjectStatusType } from "../../shared/types/enums";

/**
 * Schema for validating project data.
 */
export const projectSchema = z.object({
  _id: z.string(),
  title: z.string(),
  technologies: z.array(z.string()),
  startDate: z.string().transform((dateStr) => new Date(dateStr)),
  endDate: z
    .string()
    .nullable()
    .transform((dateStr) => (dateStr ? new Date(dateStr) : null)),
  shortDescription: z.string(),
  longDescription: z.string(),
  githubLink: z
    .url({
      protocol: /^https?$/,
      hostname: z.regexes.domain,
    })
    .nullable(),
  projectSource: z.enum(ProjectSourceType).default(ProjectSourceType.HOBBY),
  websiteLink: z
    .url({
      protocol: /^https?$/,
      hostname: z.regexes.domain,
    })
    .nullable(),
  mainImage: z.object({
    srcPath: z.string().regex(/\.(png|jpe?g|webp|svg)$/i, "Invalid image URL"),
    altText: z.string(),
  }),
  otherImages: z
    .array(
      z.object({
        srcPath: z
          .string()
          .regex(/\.(png|jpe?g|webp|svg)$/i, "Invalid image URL"),
        altText: z.string(),
      }),
    )
    .optional(),
  status: z.enum(ProjectStatusType).default(ProjectStatusType.COMPLETED),
  gainedExperience: z.array(z.string()),
});

/**
 * Type representing a validated project.
 */
export type ValidatedProject = z.infer<typeof projectSchema>;
