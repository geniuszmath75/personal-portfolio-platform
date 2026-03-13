import z from "zod";
import { UploadCategory } from "../../shared/types/enums";

export const uploadCategorySchema = z.enum(UploadCategory);

export type ValidatedUploadCategory = z.infer<typeof uploadCategorySchema>;
