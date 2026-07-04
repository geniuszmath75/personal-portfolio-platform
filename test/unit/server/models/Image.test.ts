import { describe, it, expect } from "vitest";
import mongoose, { type HydratedDocument } from "mongoose";
import type { Image } from "../../../../shared/types";
import { ImageSchema } from "../../../../server/models/Image";

const TestImageSchema = mongoose.model<Image>("TestImage", ImageSchema);

describe("Image schema", () => {
  /**
   * SRC PATH
   */
  describe("srcPath", () => {
    it("should be required", async () => {
      const imageDoc: HydratedDocument<Image> = new TestImageSchema({
        altText: "image.jpg",
      });

      await expect(imageDoc.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          srcPath: expect.objectContaining({
            message: "Image source path is required",
          }),
        }),
      });
    });

    it("should reject path that do not point to a valid image file", async () => {
      const imageDoc: HydratedDocument<Image> = new TestImageSchema({
        srcPath: "/images/projects/image.js",
        altText: "image.jpg",
      });

      await expect(imageDoc.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          srcPath: expect.objectContaining({
            message: "Image source path must point to a valid image file.",
          }),
        }),
      });
    });

    it("should reject too short source path", async () => {
      const imageDoc: HydratedDocument<Image> = new TestImageSchema({
        srcPath: "a.jpg",
        altText: "image.jpg",
      });

      await expect(imageDoc.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          srcPath: expect.objectContaining({
            message: "Image source path must be at least 6 characters long",
          }),
        }),
      });
    });
  });

  /**
   * ALT TEXT
   */
  describe("altText", () => {
    it("should be required", async () => {
      const imageDoc: HydratedDocument<Image> = new TestImageSchema({
        srcPath: "/images/projects/image.jpg",
      });

      await expect(imageDoc.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          altText: expect.objectContaining({
            message: "Alternative text is required",
          }),
        }),
      });
    });
  });
});
