import z from "zod";

export const updateUserProfileSchema = z.object({
  email: z.string().optional(),
  username: z.string().optional(),
  avatar: z
    .string()
    .refine(
      (val) =>
        val.startsWith("/uploads/avatars/") || z.url().safeParse(val).success,
      "Invalid avatar URL or path",
    )
    .optional(),
});

export type ValidatedUpdateUserProfile = z.infer<
  typeof updateUserProfileSchema
>;
