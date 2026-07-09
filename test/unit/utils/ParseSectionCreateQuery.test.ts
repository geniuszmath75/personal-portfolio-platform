import { describe, expect, it } from "vitest";
import {
  parseSectionInsertAfter,
  parseSectionPlacement,
} from "../../../app/utils/parseSectionCreateQuery";

describe("parseSectionCreateQuery", () => {
  describe("parseSectionPlacement", () => {
    it("should default to home when placement is missing", () => {
      expect(parseSectionPlacement({})).toBe("home");
    });

    it("should parse standalone placement", () => {
      expect(parseSectionPlacement({ placement: "standalone" })).toBe(
        "standalone",
      );
    });

    it("should treat unknown placement as home", () => {
      expect(parseSectionPlacement({ placement: "other" })).toBe("home");
    });
  });

  describe("parseSectionInsertAfter", () => {
    it("should return null when insertAfter is missing", () => {
      expect(parseSectionInsertAfter({})).toBeNull();
    });

    it("should parse a valid insertAfter value", () => {
      expect(parseSectionInsertAfter({ insertAfter: "2" })).toBe(2);
    });

    it("should reject invalid insertAfter values", () => {
      expect(parseSectionInsertAfter({ insertAfter: "-1" })).toBeNull();
      expect(parseSectionInsertAfter({ insertAfter: "1.5" })).toBeNull();
      expect(parseSectionInsertAfter({ insertAfter: "abc" })).toBeNull();
    });
  });
});
