import z from "zod";
import { UserSchemaRole } from "../types/enums";

export const jwtPayloadSchema = z.object({
  userId: z.string().regex(/^[0-9a-f]{24}$/),
  email: z.email({
    pattern:
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    error: "Email is not valid",
  }),
  role: z.enum(UserSchemaRole),
});

export type ValidatedJwtPayload = z.infer<typeof jwtPayloadSchema>;
