import { describe, expect, it } from "vitest";
import {
  getSectionBackgroundClass,
  getSectionTextColorClass,
  getSectionBtnLinkColorClasses,
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

  describe("getSectionBtnLinkColorClasses", () => {
    const filledCta =
      "text-primary-500 bg-additional-500 hover:bg-additional-600";
    const primaryOutline =
      "text-primary-500 border-2 bg-transparent border-primary-500 hover:bg-primary-500 hover:text-additional-500";
    const additionalOutline =
      "text-additional-500 border-2 bg-transparent border-additional-500 hover:bg-additional-500 hover:text-primary-500";

    it.each([
      { btnIndex: 0, expected: filledCta },
      { btnIndex: 2, expected: filledCta },
      { btnIndex: 4, expected: filledCta },
    ])(
      "should return filled CTA classes for even btnIndex $btnIndex",
      ({ btnIndex, expected }) => {
        expect(getSectionBtnLinkColorClasses(1, btnIndex)).toBe(expected);
      },
    );

    it.each([
      { order: 2, btnIndex: 1, expected: primaryOutline },
      { order: 4, btnIndex: 3, expected: primaryOutline },
    ])(
      "should return primary outline for odd btnIndex on even order $order",
      ({ order, btnIndex, expected }) => {
        expect(getSectionBtnLinkColorClasses(order, btnIndex)).toBe(expected);
      },
    );

    it.each([
      { order: 1, btnIndex: 1, expected: additionalOutline },
      { order: 3, btnIndex: 5, expected: additionalOutline },
    ])(
      "should return additional outline for odd btnIndex on odd order $order",
      ({ order, btnIndex, expected }) => {
        expect(getSectionBtnLinkColorClasses(order, btnIndex)).toBe(expected);
      },
    );
  });
});
