import z from "zod";

export const imageSchema = z.object({
  srcPath: z
    .string()
    .regex(
      /\.(png|jpe?g|webp|svg)$/i,
      "Image source path must point to a valid image file",
    )
    .min(6, "Image source path must be at least 6 characters long"),
  altText: z.string().min(1, "Alternative text is required"),
});
