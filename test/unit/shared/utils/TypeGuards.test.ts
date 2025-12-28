import { describe, it, expect } from "vitest";
import {
  isDefinedAndNotNull,
  isObjectWithSpecificProperty,
} from "../../../../shared/utils/typeGuards";

describe("typeGuards", () => {
  describe("isDefinedAndNotNull", () => {
    it("should return true for defined and non-null values", () => {
      expect(isDefinedAndNotNull("string")).toBe(true);
      expect(isDefinedAndNotNull(0)).toBe(true);
      expect(isDefinedAndNotNull(false)).toBe(true);
      expect(isDefinedAndNotNull({})).toBe(true);
      expect(isDefinedAndNotNull([])).toBe(true);
    });

    it("should return false for undefined value", () => {
      expect(isDefinedAndNotNull(undefined)).toBe(false);
    });

    it("should return false for null value", () => {
      expect(isDefinedAndNotNull(null)).toBe(false);
    });
  });

  describe("isObjectWithSpecificProperty", () => {
    it("should return true when object has the specified property", () => {
      const obj = { name: "John", age: 30 };
      expect(isObjectWithSpecificProperty(obj, "name")).toBe(true);
      expect(isObjectWithSpecificProperty(obj, "age")).toBe(true);
    });

    it("should return false when object does not have the specified property", () => {
      const obj = { name: "John" };
      expect(isObjectWithSpecificProperty(obj, "age")).toBe(false);
    });

    it("should return false for null value", () => {
      expect(isObjectWithSpecificProperty(null, "property")).toBe(false);
    });
  });
});
