import { describe, expect, it } from "vitest";
import {
  buildSectionInsertCreateUrl,
  getSectionInsertAriaLabel,
} from "../../../app/utils/buildSectionInsertCreateUrl";

describe("buildSectionInsertCreateUrl", () => {
  it("should build home placement url without insertAfter", () => {
    expect(buildSectionInsertCreateUrl()).toBe(
      "/sections/create?placement=home",
    );
  });

  it("should include insertAfter when provided", () => {
    expect(buildSectionInsertCreateUrl(2)).toBe(
      "/sections/create?placement=home&insertAfter=2",
    );
  });
});

describe("getSectionInsertAriaLabel", () => {
  it("should describe home page insertion without insertAfter", () => {
    expect(getSectionInsertAriaLabel()).toBe("Insert section on home page");
  });

  it("should describe insertion after a specific order", () => {
    expect(getSectionInsertAriaLabel(2)).toBe("Insert section after order 2");
  });
});
