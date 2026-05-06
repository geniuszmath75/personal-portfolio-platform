import { describe, it, expect } from "vitest";
import {
  loginValidationRules,
  adminProfileValidationRules,
  createProjectValidationRules,
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

  describe("createProjectValidationRules", () => {
    it("should define validation rules for all required fields", () => {
      expect(createProjectValidationRules).toHaveProperty("title");
      expect(createProjectValidationRules).toHaveProperty("shortDescription");
      expect(createProjectValidationRules).toHaveProperty("longDescription");
      expect(createProjectValidationRules).toHaveProperty("startDate");
      expect(createProjectValidationRules).toHaveProperty("githubLink");
      expect(createProjectValidationRules).toHaveProperty("websiteLink");
    });

    describe("title validation", () => {
      it("should define required, minLength and maxLength rules for title", () => {
        const titleRules = createProjectValidationRules.title;

        expect(titleRules).toHaveProperty("required");
        expect(titleRules).toHaveProperty("minLength");
        expect(titleRules).toHaveProperty("maxLength");

        expect(titleRules.required.$message).toBeDefined();
        expect(titleRules.minLength.$message).toBeDefined();
        expect(titleRules.maxLength.$message).toBeDefined();
      });
    });

    describe("shortDescription validation", () => {
      it("should define required and maxLength rules for shortDescription", () => {
        const shortDescRules = createProjectValidationRules.shortDescription;

        expect(shortDescRules).toHaveProperty("required");
        expect(shortDescRules).toHaveProperty("maxLength");

        expect(shortDescRules.required.$message).toBeDefined();
        expect(shortDescRules.maxLength.$message).toBeDefined();
      });
    });

    describe("longDescription validation", () => {
      it("should define required, minLength and maxLength rules for longDescription", () => {
        const longDescRules = createProjectValidationRules.longDescription;

        expect(longDescRules).toHaveProperty("required");
        expect(longDescRules).toHaveProperty("minLength");
        expect(longDescRules).toHaveProperty("maxLength");

        expect(longDescRules.required.$message).toBeDefined();
        expect(longDescRules.minLength.$message).toBeDefined();
        expect(longDescRules.maxLength.$message).toBeDefined();
      });
    });

    describe("startDate validation", () => {
      it("should define required rule for startDate", () => {
        const startDateRules = createProjectValidationRules.startDate;

        expect(startDateRules).toHaveProperty("required");
        expect(startDateRules.required.$message).toBeDefined();
      });
    });

    describe("githubLink validation", () => {
      it("should define url, httpsOnly, githubDomain and maxLength rules for githubLink", () => {
        const githubLinkRules = createProjectValidationRules.githubLink;

        expect(githubLinkRules).toHaveProperty("url");
        expect(githubLinkRules).toHaveProperty("httpsOnly");
        expect(githubLinkRules).toHaveProperty("githubDomain");
        expect(githubLinkRules).toHaveProperty("maxLength");

        expect(githubLinkRules.url.$message).toBeDefined();
        expect(githubLinkRules.httpsOnly.$message).toBeDefined();
        expect(githubLinkRules.githubDomain.$message).toBeDefined();
        expect(githubLinkRules.maxLength.$message).toBeDefined();
      });
    });

    describe("websiteLink validation", () => {
      it("should define url, httpsOnly and maxLength rules for websiteLink", () => {
        const websiteLinkRules = createProjectValidationRules.websiteLink;

        expect(websiteLinkRules).toHaveProperty("url");
        expect(websiteLinkRules).toHaveProperty("httpsOnly");
        expect(websiteLinkRules).toHaveProperty("maxLength");

        expect(websiteLinkRules.url.$message).toBeDefined();
        expect(websiteLinkRules.httpsOnly.$message).toBeDefined();
        expect(websiteLinkRules.maxLength.$message).toBeDefined();
      });
    });
  });
});
