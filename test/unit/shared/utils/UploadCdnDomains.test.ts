import { afterEach, describe, expect, it } from "vitest";
import { uploadCdnDomains } from "../../../../shared/utils/uploadCdnDomains";

describe("uploadCdnDomains", () => {
  const originalEnv = process.env.UPLOAD_PUBLIC_BASE_URL;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.UPLOAD_PUBLIC_BASE_URL;
    } else {
      process.env.UPLOAD_PUBLIC_BASE_URL = originalEnv;
    }
  });

  it("should return an empty array when the base URL is missing", () => {
    expect(uploadCdnDomains(undefined)).toEqual([]);
    expect(uploadCdnDomains("")).toEqual([]);
    expect(uploadCdnDomains("   ")).toEqual([]);
  });

  it("should extract the hostname from a full HTTPS URL", () => {
    expect(uploadCdnDomains("https://cdn.example.com")).toEqual([
      "cdn.example.com",
    ]);
  });

  it("should ignore path and query on a full URL", () => {
    expect(
      uploadCdnDomains("https://cdn.example.com/uploads/photo.jpg?x=1"),
    ).toEqual(["cdn.example.com"]);
  });

  it("should accept a bare hostname", () => {
    expect(uploadCdnDomains("cdn.example.com")).toEqual(["cdn.example.com"]);
  });

  it("should accept a bare hostname with a path", () => {
    expect(uploadCdnDomains("cdn.example.com/uploads")).toEqual([
      "cdn.example.com",
    ]);
  });

  it("should trim surrounding whitespace", () => {
    expect(uploadCdnDomains("  https://cdn.example.com  ")).toEqual([
      "cdn.example.com",
    ]);
  });

  it("should fall back to the first path segment when URL parsing fails", () => {
    expect(uploadCdnDomains("not a valid url!!!")).toEqual([
      "not a valid url!!!",
    ]);
  });

  it("should read UPLOAD_PUBLIC_BASE_URL from the environment by default", () => {
    process.env.UPLOAD_PUBLIC_BASE_URL = "https://r2.example.com";
    expect(uploadCdnDomains()).toEqual(["r2.example.com"]);
  });
});
