import {
  helpers,
  required,
  minLength,
  maxLength,
  integer,
  minValue,
} from "@vuelidate/validators";

/**
 * Client-side validation for section metadata (step 1).
 * Mirrors createSectionSchema fields except blocks.
 */
export const sectionMetadataValidationRules = {
  title: {
    minLength: helpers.withMessage(
      "Title must be at least 3 characters long",
      (value: string) => !value.trim() || value.trim().length >= 3,
    ),
    maxLength: helpers.withMessage(
      "Title must be at most 64 characters long",
      maxLength(64),
    ),
  },
  slug: {
    required: helpers.withMessage("Slug is required", required),
    minLength: helpers.withMessage(
      "Slug must be at least 2 characters long",
      minLength(2),
    ),
    maxLength: helpers.withMessage(
      "Slug must be at most 50 characters long",
      maxLength(50),
    ),
  },
  order: {
    required: helpers.withMessage("Order is required", required),
    integer: helpers.withMessage("Order must be a whole number", integer),
    minValue: helpers.withMessage("Order must be at least 1", minValue(1)),
  },
};
