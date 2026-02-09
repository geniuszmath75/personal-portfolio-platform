import { describe, expect, it } from "vitest";
import { useTag } from "../../../app/composables/useTag";

describe("useTag", () => {
  // ------------------------------------
  // getSizeClasses
  // ------------------------------------
  describe("getSizeClasses", () => {
    it.each([
      // Arrange: possible tag sizes and their expected classes
      { size: "small", expected: "h-8 px-2 py-0.5 text-xs" },
      { size: "medium", expected: "h-10 px-3 py-1 text-sm" },
      { size: "large", expected: "h-12 px-4 py-2 text-base" },
      { size: undefined, expected: "h-10 px-3 py-1 text-sm" },
    ] as const)(
      "should return correct classes for size='$size'",
      ({ size, expected }) => {
        // Arrange
        const props = { size };

        // Act
        const { getSizeClasses } = useTag(props);

        // Assert
        expect(getSizeClasses.value).toBe(expected);
      },
    );
  });

  // ------------------------------------
  // getBorderClasses
  // ------------------------------------
  describe("getBorderClasses", () => {
    it.each([
      // Arrange: combinations of type, bordered, dashed
      {
        type: "default",
        bordered: true,
        dashed: false,
        expected: "border border-additional-500 border-solid",
      },
      {
        type: "primary",
        bordered: true,
        dashed: true,
        expected: "border border-secondary-500 border-dashed",
      },
      {
        type: "info",
        bordered: true,
        dashed: false,
        expected: "border border-info-500 border-solid",
      },
      {
        type: "success",
        bordered: false,
        dashed: true,
        expected: "border-none border-success-500 border-dashed",
      },
      {
        type: "warning",
        bordered: true,
        dashed: false,
        expected: "border border-warning-500 border-solid",
      },
      {
        type: "error",
        bordered: false,
        dashed: false,
        expected: "border-none border-error-500 border-solid",
      },
    ] as const)(
      "should return correct border classes for type='$type', bordered=$bordered, dashed=$dashed",
      ({ type, bordered, dashed, expected }) => {
        // Arrange
        const props = { type, bordered, dashed };

        // Act
        const { getBorderClasses } = useTag(props);

        // Assert
        expect(getBorderClasses.value).toBe(expected);
      },
    );
  });

  // ------------------------------------
  // getRoundedClass
  // ------------------------------------
  describe("getRoundedClass", () => {
    it.each([
      // Arrange: rounded variations
      { rounded: true, expected: "rounded-2xl" },
      { rounded: false, expected: "rounded-none" },
      { rounded: undefined, expected: "rounded-none" },
    ] as const)(
      "should return correct rounded class when rounded=$rounded",
      ({ rounded, expected }) => {
        // Arrange
        const props = { rounded };

        // Act
        const { getRoundedClass } = useTag(props);

        // Assert
        expect(getRoundedClass.value).toBe(expected);
      },
    );
  });

  // ------------------------------------
  // getTypeClasses
  // ------------------------------------
  describe("getTypeClasses", () => {
    it.each([
      // Arrange: different tag types
      {
        type: "default",
        expected: "bg-secondary-500 text-primary-500",
      },
      {
        type: "primary",
        expected: "bg-primary-500 text-secondary-500",
      },
      {
        type: "info",
        expected: "bg-info-300 text-info-800",
      },
      {
        type: "success",
        expected: "bg-success-300 text-success-800",
      },
      {
        type: "warning",
        expected: "bg-warning-300 text-warning-800",
      },
      {
        type: "error",
        expected: "bg-error-300 text-error-800",
      },
      {
        type: undefined,
        expected: "bg-secondary-500 text-primary-500",
      },
    ] as const)(
      "should return correct classes for type='$type'",
      ({ type, expected }) => {
        // Arrange
        const props = { type };

        // Act
        const { getTypeClasses } = useTag(props);

        // Assert
        expect(getTypeClasses.value).toBe(expected);
      },
    );
  });
});
