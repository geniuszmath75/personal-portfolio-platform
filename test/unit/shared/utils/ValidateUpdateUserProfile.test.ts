import { describe, it, expect } from "vitest";
import { updateUserProfileSchema } from "../../../../shared/utils/validateUpdateUserProfile";

describe("updateUserProfileSchema", () => {
  describe("valid data", () => {
    it("should parse empty object when all fields are optional", () => {
      const result = updateUserProfileSchema.safeParse({});

      expect(result.success).toBe(true);
    });

    it("should parse valid email", () => {
      const result = updateUserProfileSchema.safeParse({
        email: "user@example.com",
      });

      expect(result.success).toBe(true);
    });

    it("should parse valid username", () => {
      const result = updateUserProfileSchema.safeParse({ username: "JohnDoe" });

      expect(result.success).toBe(true);
    });

    it("should parse avatar with valid /uploads/avatars/ path", () => {
      const result = updateUserProfileSchema.safeParse({
        avatar: "/uploads/avatars/photo.png",
      });

      expect(result.success).toBe(true);
    });

    it("should parse avatar with valid URL", () => {
      const result = updateUserProfileSchema.safeParse({
        avatar: "https://example.com/avatar.png",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("invalid data", () => {
    it("should fail for avatar with invalid path and invalid URL", () => {
      const result = updateUserProfileSchema.safeParse({
        avatar: "invalid-avatar",
      });

      expect(result.success).toBe(false);
    });

    it("should fail for avatar with path not starting with /uploads/avatars/", () => {
      const result = updateUserProfileSchema.safeParse({
        avatar: "/other/path/photo.png",
      });

      expect(result.success).toBe(false);
    });
  });
});
