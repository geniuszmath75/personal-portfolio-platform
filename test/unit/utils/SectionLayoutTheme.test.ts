import { describe, expect, it } from "vitest";
import {
  getSectionBackgroundClass,
  getSectionTextColorClass,
} from "../../../app/utils/sectionLayoutTheme";

describe("sectionLayoutTheme", () => {
  describe("getSectionBackgroundClass", () => {
    it.each([
      { order: 1, expected: "bg-primary-500" },
      { order: 2, expected: "bg-secondary-500" },
      { order: 3, expected: "bg-primary-500" },
    ])("should return $expected for order $order", ({ order, expected }) => {
      expect(getSectionBackgroundClass(order)).toBe(expected);
    });
  });

  describe("getSectionTextColorClass", () => {
    it.each([
      { order: 1, expected: "text-secondary-500" },
      { order: 2, expected: "text-primary-500" },
      { order: 3, expected: "text-secondary-500" },
    ])("should return $expected for order $order", ({ order, expected }) => {
      expect(getSectionTextColorClass(order)).toBe(expected);
    });
  });
});
