import { Document } from "mongoose";
import { StringValue } from "@types/ms";

declare global {
  /**
   * UserSchema
   *
   * Represents the user schema in the database.
   */
  interface UserSchema extends Document {
    /**
     * The user's email address.
     */
    email: string;

    /**
     * The user's hashed password.
     */
    password: string;

    /**
     * The user's username.
     */
    username: string;

    /**
     * The user's role in the system.
     */
    role: UserSchemaRole | undefined;

    /**
     * The user's avatar URL.
     */
    avatar?: string;
    createJWT(): string;
    comparePassword(candidatePassword: string): Promise<boolean>;
  }

  /**
   * UserSchemaRole
   *
   * Represents the roles that a user can have in the system.
   */
  const enum UserSchemaRole {
    ADMIN = "ADMIN",
  }
}

declare module "@nuxt/schema" {
  interface RuntimeConfig {
    jwtSecret: string;
    jwtLifetime: number | StringValue;
  }
}

export { UserSchema };
