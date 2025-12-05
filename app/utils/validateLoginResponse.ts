import z from "zod";
import { UserSchemaRole } from "../../server/types/enums";

export const loginResponseSchema = z.object({
  user: z.object({
    email: z.email({
      pattern:
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      error: "Email is not valid",
    }),
    role: z.enum(UserSchemaRole),
  }),
  token: z.jwt(),
});

export type ValidatedLoginCredentials = z.infer<typeof loginResponseSchema>;
