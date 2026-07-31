import { describe, expect, it } from "vitest";
import { toAbsoluteUrl } from "../../../../shared/utils/toAbsoluteUrl";

describe("toAbsoluteUrl", () => {
  it("should return undefined for empty input", () => {
    expect(toAbsoluteUrl(undefined, "https://example.com")).toBeUndefined();
    expect(toAbsoluteUrl(null, "https://example.com")).toBeUndefined();
    expect(toAbsoluteUrl("", "https://example.com")).toBeUndefined();
  });

  it("should return absolute http(s) URLs unchanged", () => {
    expect(
      toAbsoluteUrl("https://cdn.example.com/a.jpg", "https://example.com"),
    ).toBe("https://cdn.example.com/a.jpg");
  });

  it("should join site URL with a relative path", () => {
    expect(toAbsoluteUrl("/projects", "https://example.com/")).toBe(
      "https://example.com/projects",
    );
    expect(toAbsoluteUrl("og.png", "https://example.com")).toBe(
      "https://example.com/og.png",
    );
  });

  it("should fall back to request origin when site URL is missing", () => {
    expect(toAbsoluteUrl("/projects", "", "http://localhost:3000")).toBe(
      "http://localhost:3000/projects",
    );
  });

  it("should return a site-relative path when no origin is available", () => {
    expect(toAbsoluteUrl("/projects", undefined)).toBe("/projects");
  });
});
