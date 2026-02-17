import {
  helpers,
  required,
  email,
  minLength,
  maxLength,
} from "@vuelidate/validators";

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
