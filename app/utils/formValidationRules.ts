import {
  helpers,
  required,
  email,
  minLength,
  maxLength,
} from "@vuelidate/validators";

/**
 * Helpers
 */
const httpsUrl = (value: string) => !value || value.startsWith("https://");

const githubDomain = (value: string) => !value || value.includes("github.com");

/**
 * Validation rules for the login form
 */
export const loginValidationRules = {
  email: {
    required: helpers.withMessage("Email is required", required),
    email: helpers.withMessage("Email is not valid", email),
  },
  password: {
    required: helpers.withMessage("Password is required", required),
  },
};

export const adminProfileValidationRules = {
  email: {
    required: helpers.withMessage("Email cannot be empty", required),
    email: helpers.withMessage("Email is not valid", email),
  },
  username: {
    required: helpers.withMessage("Username cannot be empty", required),
    minLength: helpers.withMessage(
      "Username must be at least 3 characters long",
      minLength(3),
    ),
    maxLength: helpers.withMessage(
      "Username must be at most 50 characters long",
      maxLength(50),
    ),
  },
};

export const createProjectValidationRules = {
  title: {
    required: helpers.withMessage("Title is required", required),
    minLength: helpers.withMessage(
      "Title must be at least 3 characters long",
      minLength(3),
    ),
    maxLength: helpers.withMessage(
      "Title must be at most 32 characters long",
      maxLength(32),
    ),
  },

  shortDescription: {
    required: helpers.withMessage("Short description is required", required),
    maxLength: helpers.withMessage(
      "Short description must be at most 64 characters long",
      maxLength(64),
    ),
  },

  longDescription: {
    required: helpers.withMessage("Long description is required", required),
    minLength: helpers.withMessage(
      "Long description must be at least 64 characters long",
      minLength(64),
    ),
    maxLength: helpers.withMessage(
      "Long description must be at most 1024 characters long",
      maxLength(1024),
    ),
  },

  startDate: {
    required: helpers.withMessage("Start date is required", required),
  },

  // endDate is optional – no required rule

  githubLink: {
    url: helpers.withMessage(
      "GitHub link must be a valid URL",
      helpers.regex(/^(https?:\/\/).+/),
    ),
    httpsOnly: helpers.withMessage(
      "GitHub link must use HTTPS",
      helpers.withAsync(async (v: string) => !v || httpsUrl(v)),
    ),
    githubDomain: helpers.withMessage(
      "GitHub link must point to github.com",
      helpers.withAsync(async (v: string) => !v || githubDomain(v)),
    ),
    maxLength: helpers.withMessage(
      "GitHub link must be at most 100 characters long",
      maxLength(100),
    ),
  },

  websiteLink: {
    url: helpers.withMessage(
      "Website link must be a valid URL",
      helpers.regex(/^(https?:\/\/).+/),
    ),
    httpsOnly: helpers.withMessage(
      "Website link must use HTTPS",
      helpers.withAsync(async (v: string) => !v || httpsUrl(v)),
    ),
    maxLength: helpers.withMessage(
      "Website link must be at most 100 characters long",
      maxLength(100),
    ),
  },
};
