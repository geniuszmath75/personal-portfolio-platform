import { describe, it, expect } from "vitest";
import { uploadCategorySchema } from "../../../../server/utils/validateUploadImage";

describe("validateUploadImage util", () => {
  it("should reject invalid role", () => {
    const invalidRole = "INVALID_ROLE";
    expect(() => uploadCategorySchema.parse(invalidRole)).toThrow();
  });

  it("should reject null role", () => {
    const nullRole = null;
    expect(() => uploadCategorySchema.parse(nullRole)).toThrow();
  });
});
