import type { Model } from "mongoose";
import type { UserSchemaRole } from "./enums";
import type { IProject } from "~~/shared/types";

/********
 * USER
 *
 * Represents the user schema in the system.
 ********/

export interface IUser {
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
  role: UserSchemaRole;

  /**
   * The user's avatar URL.
   */
  avatar?: string;
}

/**
 * Methods available on the IUser schema.
 */
export interface IUserMethods {
  /**
   * Generates a JSON Web Token (JWT) for the user.
   * @returns {string} The generated JWT.
   */
  createJWT(): string;

  /**
   * Compares a candidate password with the user's stored password.
   *
   * @param candidatePassword - The password to compare against the user's stored password.
   * @return {Promise<boolean>} A promise that resolves to true if the passwords match, false otherwise.
   */
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/********
 * MODELS
 ********/

/**
 * Represents a Mongoose model for the ISection schema.
 */
export type SectionModel = Model<ISection, object>;

/**
 * Represents a Mongoose model for the IUser schema.
 */
export type UserModel = Model<IUser, object, IUserMethods>;

/**
 * Represents a Mongoose model for the IProject schema
 */
export type ProjectModel = Model<IProject, object>;

/**
 * Represents information about the authenticated user
 */
export interface AuthUser {
  user_id: string;
  email: string;
  role: UserSchemaRole;
}

/***********
 * CONFIGURATION
 *
 * Overrides the Nuxt runtime configuration variables with custom types.
 ***********/
declare module "@nuxt/schema" {
  export interface RuntimeConfig {
    jwtSecret: string;
    jwtLifetime: string;
  }
}

/**
 * Overrides the h3 event.context object with custom types
 */
declare module "h3" {
  interface H3EventContext {
    user: AuthUser | null;
    isAuthenticated: boolean;
  }
}
