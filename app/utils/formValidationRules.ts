import { helpers, required, email } from "@vuelidate/validators";

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
