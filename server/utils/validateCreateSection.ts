import z from "zod";
import { ISectionType } from "../../shared/types/enums";
import { blockSchema } from "../../shared/utils/validateSectionBlocks";

export const createSectionSchema = z.object({
  title: z.string().min(3).max(64).nullable().optional(),
  slug: z.string().min(2).max(50),
  type: z.enum(ISectionType).default(ISectionType.HERO),
  order: z.int().positive(),
  blocks: z.array(blockSchema).min(1),
});

export type CreateSectionSchema = z.infer<typeof createSectionSchema>;
