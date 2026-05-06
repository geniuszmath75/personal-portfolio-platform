import { describe, it, expect } from "vitest";
import { imageSchema } from "../../../../server/utils/validateImage";

describe("validateImage util", () => {
  describe("srcPath validation", () => {
    it("should accept valid .png file path", () => {
      const result = imageSchema.parse({
        srcPath: "image.png",
        altText: "A test image",
      });
      expect(result.srcPath).toBe("image.png");
    });

    it("should accept valid .jpg file path", () => {
      const result = imageSchema.parse({
        srcPath: "photo.jpg",
        altText: "A test image",
      });
      expect(result.srcPath).toBe("photo.jpg");
    });

    it("should accept valid .jpeg file path", () => {
      const result = imageSchema.parse({
        srcPath: "picture.jpeg",
        altText: "A test image",
      });
      expect(result.srcPath).toBe("picture.jpeg");
    });

    it("should accept valid .webp file path", () => {
      const result = imageSchema.parse({
        srcPath: "modern.webp",
        altText: "A test image",
      });
      expect(result.srcPath).toBe("modern.webp");
    });

    it("should reject srcPath with invalid file extension", () => {
      const payload = {
        srcPath: "document.pdf",
        altText: "A test image",
      };
      expect(() => imageSchema.parse(payload)).toThrow();
    });
  });

  describe("altText validation", () => {
    it("should accept valid altText with single character", () => {
      const result = imageSchema.parse({
        srcPath: "image.png",
        altText: "A",
      });
      expect(result.altText).toBe("A");
    });

    it("should accept valid altText with multiple words", () => {
      const result = imageSchema.parse({
        srcPath: "image.png",
        altText: "A beautiful landscape photograph",
      });
      expect(result.altText).toBe("A beautiful landscape photograph");
    });

    it("should reject empty altText", () => {
      const payload = {
        srcPath: "image.png",
        altText: "",
      };
      expect(() => imageSchema.parse(payload)).toThrow();
    });

    it("should accept altText with special characters", () => {
      const result = imageSchema.parse({
        srcPath: "image.png",
        altText: "Image with special chars: @#$%",
      });
      expect(result.altText).toBe("Image with special chars: @#$%");
    });

    it("should accept altText with numeric values", () => {
      const result = imageSchema.parse({
        srcPath: "image.png",
        altText: "Image number 123",
      });
      expect(result.altText).toBe("Image number 123");
    });
  });

  describe("combined validation", () => {
    it("should reject when srcPath is too short", () => {
      const payload = {
        srcPath: "a.png",
        altText: "Test",
      };
      expect(() => imageSchema.parse(payload)).toThrow();
    });

    it("should accept valid .svg file path", () => {
      const result = imageSchema.parse({
        srcPath: "icon.svg",
        altText: "Icon",
      });
      expect(result.srcPath).toBe("icon.svg");
    });

    it("should handle case-insensitive file extensions", () => {
      const result = imageSchema.parse({
        srcPath: "image.PNG",
        altText: "Test image",
      });
      expect(result.srcPath).toBe("image.PNG");
    });

    it("should reject missing file extension", () => {
      const payload = {
        srcPath: "imagefile",
        altText: "Test",
      };
      expect(() => imageSchema.parse(payload)).toThrow();
    });
  });
});
