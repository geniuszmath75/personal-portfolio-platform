import z from "zod";
import { ISectionType } from "../../shared/types/enums";
import { blockSchema } from "../../shared/utils/validateSectionBlocks";

export const sectionSchema = z.object({
  _id: z.string(),
  title: z.string().min(3).max(64).nullable().optional(),
  slug: z.string().min(2).max(50),
  order: z.int().positive(),
  type: z.enum(ISectionType),
  blocks: z.array(blockSchema).min(1),
});

export type ValidatedSection = z.infer<typeof sectionSchema>;
