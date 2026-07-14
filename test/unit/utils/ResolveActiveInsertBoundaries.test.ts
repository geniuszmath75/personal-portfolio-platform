import { describe, expect, it } from "vitest";
import { resolveActiveInsertBoundaries } from "../../../app/utils/resolveActiveInsertBoundaries";

describe("resolveActiveInsertBoundaries", () => {
  it("should return null targets when there are no boundaries", () => {
    expect(resolveActiveInsertBoundaries([], 800)).toEqual({
      activeTopInsertAfter: null,
      activeBottomInsertAfter: null,
    });
  });

  it("should pick the nearest boundary below the viewport center for bottom", () => {
    expect(
      resolveActiveInsertBoundaries(
        [
          { insertAfter: 1, top: 500 },
          { insertAfter: 2, top: 1200 },
        ],
        600,
      ),
    ).toEqual({
      activeTopInsertAfter: null,
      activeBottomInsertAfter: 1,
    });
  });

  it("should pick nearest boundaries above and below center", () => {
    expect(
      resolveActiveInsertBoundaries(
        [
          { insertAfter: 1, top: -200 },
          { insertAfter: 2, top: 800 },
          { insertAfter: 3, top: 1600 },
        ],
        600,
      ),
    ).toEqual({
      activeTopInsertAfter: 1,
      activeBottomInsertAfter: 2,
    });
  });

  it("should avoid duplicate targets for the same boundary at center", () => {
    expect(
      resolveActiveInsertBoundaries(
        [
          { insertAfter: 1, top: -100 },
          { insertAfter: 2, top: 300 },
          { insertAfter: 3, top: 900 },
        ],
        600,
      ),
    ).toEqual({
      activeTopInsertAfter: 1,
      activeBottomInsertAfter: 2,
    });
  });
});
