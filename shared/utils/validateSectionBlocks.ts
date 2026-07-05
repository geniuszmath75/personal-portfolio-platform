import z from "zod";
import { BlockKind } from "../types/enums";

const paragraphBlockSchema = z.object({
  kind: z.literal(BlockKind.PARAGRAPH),
  paragraphs: z.array(z.string().min(1)).min(1),
});

const sectionBlockImageSchema = z.object({
  srcPath: z
    .string()
    .regex(/\.(png|jpe?g|webp|svg)$/i, "Invalid image URL")
    .min(6),
  altText: z.string().min(1),
});

const imageBlockSchema = z.object({
  kind: z.literal(BlockKind.IMAGE),
  images: z.array(sectionBlockImageSchema).min(1),
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

export const blockSchema = z.discriminatedUnion("kind", [
  paragraphBlockSchema,
  imageBlockSchema,
  buttonBlockSchema,
  groupBlockSchema,
]);

export type ValidatedSectionBlock = z.infer<typeof blockSchema>;
