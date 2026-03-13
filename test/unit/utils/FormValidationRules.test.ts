import { describe, it, expect } from "vitest";
import {
  loginValidationRules,
  adminProfileValidationRules,
} from "../../../app/utils/formValidationRules";

describe("formValidationRules util", () => {
  describe("loginValidationRules", () => {
    it("should define validation rules for email and password", () => {
      expect(loginValidationRules).toHaveProperty("email");
      expect(loginValidationRules).toHaveProperty("password");
    });

    it("should define required and email rules for email field", () => {
      const emailRules = loginValidationRules.email;

      expect(emailRules).toHaveProperty("required");
      expect(emailRules).toHaveProperty("email");

      // checking if rules are packed with helpers.withMessage
      expect(emailRules.required.$message).toBeDefined();
      expect(emailRules.email.$message).toBeDefined();
    });

    it("should define required rule for password with custom message", () => {
      const passwordRules = loginValidationRules.password;

      expect(passwordRules).toHaveProperty("required");

      // Vuelidate helper with withMessage adds $message field
      expect(passwordRules.required.$message).toBeDefined();
    });
  });

  describe("adminProfileValidationRules", () => {
    it("should define validation rules for email and username", () => {
      expect(adminProfileValidationRules).toHaveProperty("email");
      expect(adminProfileValidationRules).toHaveProperty("username");
    });

    it("should define required and email rules for email field", () => {
      const emailRules = adminProfileValidationRules.email;

      expect(emailRules).toHaveProperty("required");
      expect(emailRules).toHaveProperty("email");

      // checking if rules are packed with helpers.withMessage
      expect(emailRules.required.$message).toBeDefined();
      expect(emailRules.email.$message).toBeDefined();
    });

    it("should define required, minLength and maxLengts rules for username", () => {
      const usernameRules = adminProfileValidationRules.username;

      expect(usernameRules).toHaveProperty("required");
      expect(usernameRules).toHaveProperty("minLength");
      expect(usernameRules).toHaveProperty("maxLength");

      // Vuelidate helper with withMessage adds $message field
      expect(usernameRules.required.$message).toBeDefined();
      expect(usernameRules.minLength.$message).toBeDefined();
      expect(usernameRules.maxLength.$message).toBeDefined();
    });
  });
});
