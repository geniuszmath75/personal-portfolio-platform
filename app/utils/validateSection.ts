import z from "zod";
import { BlockKind, ISectionType } from "../../shared/types/enums";

const paragraphBlockSchema = z.object({
  kind: z.literal(BlockKind.PARAGRAPH),
  paragraphs: z.array(z.string().min(1)).min(1),
});

const imageSchema = z.object({
  srcPath: z
    .string()
    .regex(/\.(png|jpe?g|webp|svg)$/i, "Invalid image URL")
    .min(6),
  altText: z.string(),
});

const imageBlockSchema = z.object({
  kind: z.literal(BlockKind.IMAGE),
  images: z.array(imageSchema),
});

const buttonBlockSchema = z.object({
  kind: z.literal(BlockKind.BUTTON),
  buttons: z.array(z.string().min(1)).min(1),
});

const groupBlockItemSchema = z.object({
  icon: z.string(),
  label: z.string(),
});

const groupBlockSchema = z.object({
  kind: z.enum([BlockKind.GROUP]),
  header: z.string().min(1).optional(),
  items: z.array(groupBlockItemSchema).min(1),
});

const blockSchema = z.discriminatedUnion("kind", [
  paragraphBlockSchema,
  imageBlockSchema,
  buttonBlockSchema,
  groupBlockSchema,
]);

export const sectionSchema = z.object({
  _id: z.string(),
  title: z.string().nullable().optional(),
  slug: z.string().min(1),
  order: z.int().positive(),
  type: z.enum(ISectionType),
  blocks: z.array(blockSchema),
});

export type ValidatedSection = z.infer<typeof sectionSchema>;
