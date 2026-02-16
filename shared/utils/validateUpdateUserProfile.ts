import z from "zod";

export const updateUserProfileSchema = z.object({
  email: z.string().optional(),
  username: z.string().optional(),
});

export type ValidatedUpdateUserProfile = z.infer<
  typeof updateUserProfileSchema
>;
