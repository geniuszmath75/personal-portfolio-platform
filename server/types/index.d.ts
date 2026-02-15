import type { Model } from "mongoose";
import type { IProject, AuthUser, IUser, IUserMethods } from "~~/shared/types";

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
