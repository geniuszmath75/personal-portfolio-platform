import z from "zod";

export const imageUploadResponseSchema = z.object({
  url: z
    .string()
    .refine(
      (val) => val.startsWith("/uploads/") || z.url().safeParse(val).success,
      "Invalid image URL or path",
    ),
  filename: z.string(),
  size: z.int().min(0),
  mimetype: z.string(),
});

export const imageCreationResponseSchema = z.object({
  success: z.boolean(),
  data: z.object(imageUploadResponseSchema.shape),
});

export type ValidatedImageCreationResponse = z.infer<
  typeof imageCreationResponseSchema
>;
