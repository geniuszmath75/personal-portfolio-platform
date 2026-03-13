import { describe, expect, it } from "vitest";
import {
  imageUploadResponseSchema,
  imageCreationResponseSchema,
} from "../../../app/utils/validateImageUpload";

describe("validateImageUpload", () => {
  describe("imageUploadResponseSchema", () => {
    const validBase = {
      url: "/uploads/image.png",
      filename: "image.png",
      size: 1024,
      mimetype: "image/png",
    };

    describe("url", () => {
      it("should accept a local /uploads/ path", () => {
        const result = imageUploadResponseSchema.safeParse(validBase);
        expect(result.success).toBe(true);
      });

      it("should accept a valid http URL", () => {
        const result = imageUploadResponseSchema.safeParse({
          ...validBase,
          url: "http://example.com/image.png",
        });
        expect(result.success).toBe(true);
      });

      it("should accept a valid https URL", () => {
        const result = imageUploadResponseSchema.safeParse({
          ...validBase,
          url: "https://cdn.example.com/image.png",
        });
        expect(result.success).toBe(true);
      });

      it("should reject a random string that is not a path or URL", () => {
        const result = imageUploadResponseSchema.safeParse({
          ...validBase,
          url: "not-a-valid-url",
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe(
          "Invalid image URL or path",
        );
      });

      it("should reject an empty string", () => {
        const result = imageUploadResponseSchema.safeParse({
          ...validBase,
          url: "",
        });
        expect(result.success).toBe(false);
      });

      it("should reject a path not starting with /uploads/", () => {
        const result = imageUploadResponseSchema.safeParse({
          ...validBase,
          url: "/images/photo.png",
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe(
          "Invalid image URL or path",
        );
      });

      it("should reject a non-string value", () => {
        const result = imageUploadResponseSchema.safeParse({
          ...validBase,
          url: 123,
        });
        expect(result.success).toBe(false);
      });
    });

    describe("filename", () => {
      it("should accept a valid filename string", () => {
        const result = imageUploadResponseSchema.safeParse(validBase);
        expect(result.success).toBe(true);
      });

      it("should reject a non-string filename", () => {
        const result = imageUploadResponseSchema.safeParse({
          ...validBase,
          filename: 42,
        });
        expect(result.success).toBe(false);
      });

      it("should reject a missing filename", () => {
        const { filename, ...rest } = validBase;
        const result = imageUploadResponseSchema.safeParse(rest);
        expect(result.success).toBe(false);
      });
    });

    describe("size", () => {
      it("should accept size of 0", () => {
        const result = imageUploadResponseSchema.safeParse({
          ...validBase,
          size: 0,
        });
        expect(result.success).toBe(true);
      });

      it("should accept a positive integer size", () => {
        const result = imageUploadResponseSchema.safeParse({
          ...validBase,
          size: 999999,
        });
        expect(result.success).toBe(true);
      });

      it("should reject a negative size", () => {
        const result = imageUploadResponseSchema.safeParse({
          ...validBase,
          size: -1,
        });
        expect(result.success).toBe(false);
      });

      it("should reject a float size", () => {
        const result = imageUploadResponseSchema.safeParse({
          ...validBase,
          size: 10.5,
        });
        expect(result.success).toBe(false);
      });

      it("should reject a non-number size", () => {
        const result = imageUploadResponseSchema.safeParse({
          ...validBase,
          size: "1024",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("mimetype", () => {
      it("should accept image/png", () => {
        const result = imageUploadResponseSchema.safeParse(validBase);
        expect(result.success).toBe(true);
      });

      it("should accept image/jpeg", () => {
        const result = imageUploadResponseSchema.safeParse({
          ...validBase,
          mimetype: "image/jpeg",
        });
        expect(result.success).toBe(true);
      });

      it("should reject a non-string mimetype", () => {
        const result = imageUploadResponseSchema.safeParse({
          ...validBase,
          mimetype: true,
        });
        expect(result.success).toBe(false);
      });

      it("should reject a missing mimetype", () => {
        const { mimetype, ...rest } = validBase;
        const result = imageUploadResponseSchema.safeParse(rest);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("imageCreationResponseSchema", () => {
    const validResponse = {
      success: true,
      data: {
        url: "/uploads/image.png",
        filename: "image.png",
        size: 512,
        mimetype: "image/png",
      },
    };

    it("should accept a valid creation response", () => {
      const result = imageCreationResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it("should accept success: false", () => {
      const result = imageCreationResponseSchema.safeParse({
        ...validResponse,
        success: false,
      });
      expect(result.success).toBe(true);
    });

    it("should reject a missing success field", () => {
      const { success, ...rest } = validResponse;
      const result = imageCreationResponseSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("should reject a non-boolean success field", () => {
      const result = imageCreationResponseSchema.safeParse({
        ...validResponse,
        success: "true",
      });
      expect(result.success).toBe(false);
    });

    it("should reject a missing data field", () => {
      const { data, ...rest } = validResponse;
      const result = imageCreationResponseSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("should reject when data is an empty object", () => {
      const result = imageCreationResponseSchema.safeParse({
        ...validResponse,
        data: {},
      });
      expect(result.success).toBe(false);
    });
  });
});
