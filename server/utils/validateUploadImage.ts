import z from "zod";

export const uploadCategorySchema = z.enum(UploadCategory);

export type ValidatedUploadCategory = z.infer<typeof uploadCategorySchema>;
