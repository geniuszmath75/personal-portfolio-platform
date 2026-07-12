import { describe, expect, it } from "vitest";
import { resolveSectionImageSrc } from "../../../app/utils/resolveSectionImageSrc";

describe("resolveSectionImageSrc util", () => {
  it("should return absolute upload paths unchanged", () => {
    expect(resolveSectionImageSrc("/uploads/sections/photo.png")).toBe(
      "/uploads/sections/photo.png",
    );
  });

  it("should resolve legacy bare filenames against /images/", () => {
    expect(resolveSectionImageSrc("hero.png")).toBe("/images/hero.png");
  });

  it("should resolve legacy paths that already include /images/", () => {
    expect(resolveSectionImageSrc("/images/hero.png")).toBe("/images/hero.png");
  });

  it("should return blob preview URLs unchanged", () => {
    expect(
      resolveSectionImageSrc("blob:http://localhost:3000/preview-id"),
    ).toBe("blob:http://localhost:3000/preview-id");
  });

  it("should still resolve bare filenames that contain a slash later", () => {
    expect(resolveSectionImageSrc("subdir/hero.png")).toBe(
      "/images/subdir/hero.png",
    );
  });
});
