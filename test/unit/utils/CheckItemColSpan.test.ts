import { describe, it, expect } from "vitest";
import { checkItemColSpan } from "../../../app/utils/checkItemColSpan";

describe("checkItemColSpan", () => {
  it.each([
    // One full row
    { index: 0, totalItems: 3, expected: "col-span-4" },
    { index: 1, totalItems: 3, expected: "col-span-4" },
    { index: 2, totalItems: 3, expected: "col-span-4" },

    // Two full rows
    { index: 0, totalItems: 6, expected: "col-span-4" },
    { index: 1, totalItems: 6, expected: "col-span-4" },
    { index: 2, totalItems: 6, expected: "col-span-4" },
    { index: 3, totalItems: 6, expected: "col-span-4" },
    { index: 4, totalItems: 6, expected: "col-span-4" },
    { index: 5, totalItems: 6, expected: "col-span-4" },

    // 4 items - last row has 1 element at index=3
    { index: 3, totalItems: 4, expected: "col-span-12" },

    // 5 items → last row has 2 elements at indices 3, 4
    { index: 3, totalItems: 5, expected: "col-span-6" },
    { index: 4, totalItems: 5, expected: "col-span-6" },

    // Mixed case: full rows + incomplete row
    { index: 0, totalItems: 10, expected: "col-span-4" },
    { index: 1, totalItems: 10, expected: "col-span-4" },
    { index: 2, totalItems: 10, expected: "col-span-4" },
    { index: 3, totalItems: 10, expected: "col-span-4" },
    { index: 4, totalItems: 10, expected: "col-span-4" },
    { index: 5, totalItems: 10, expected: "col-span-4" },
    { index: 6, totalItems: 10, expected: "col-span-4" },
    { index: 7, totalItems: 10, expected: "col-span-4" },
    { index: 8, totalItems: 10, expected: "col-span-4" },
    { index: 9, totalItems: 10, expected: "col-span-12" },
  ])(
    "should return $expected with arguments: index = $index, totalItems = $totalItems",
    ({ index, totalItems, expected }) => {
      expect(checkItemColSpan(index, totalItems)).toBe(expected);
    },
  );
});
