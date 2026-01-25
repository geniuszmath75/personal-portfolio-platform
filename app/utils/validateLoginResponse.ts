import z from "zod";
import { UserSchemaRole } from "../../server/types/enums";

/**
 * Schema for validating authenticated user data.
 */
export const authUserSchema = z.object({
  user: z.object({
    user_id: z.string().regex(/^[0-9a-f]{24}$/),
    email: z.email({
      pattern:
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      error: "Email is not valid",
    }),
    role: z.enum(UserSchemaRole),
  }),
});

/**
 * Schema for validating login response data.
 */
export const loginResponseSchema = z.object({
  user: authUserSchema.shape.user,
  token: z.jwt(),
});

export type ValidatedAuthUser = z.infer<typeof authUserSchema>;
export type ValidatedLoginCredentials = z.infer<typeof loginResponseSchema>;
