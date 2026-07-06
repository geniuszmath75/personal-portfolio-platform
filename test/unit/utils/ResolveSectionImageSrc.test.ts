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
});
