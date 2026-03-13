import z from "zod";
import { UserSchemaRole } from "../../shared/types/enums";

export const adminUserSchema = z.object({
  admin: z.object({
    email: z.email({
      pattern:
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      error: "Email is not valid",
    }),
    username: z.string(),
    avatar: z.string().nullable(),
    role: z.enum(UserSchemaRole),
    createdAt: z.string().transform((date) => new Date(date)),
    updatedAt: z.string().transform((date) => new Date(date)),
  }),
});

export const adminDetailsResponseSchema = z.object({
  admin: adminUserSchema.shape.admin,
});

export type ValidatedAdminUser = z.infer<typeof adminUserSchema.shape.admin>;
export type ValidatedAdminDetailsResponse = z.infer<
  typeof adminDetailsResponseSchema
>;
