/**
 * Screen position of a single section seam used for insert targeting.
 */
export interface InsertBoundaryMetrics {
  /**
   * Section order after which a new section would be inserted.
   */
  insertAfter: number;

  /**
   * Distance from the seam anchor to the top of the viewport.
   */
  top: number;
}

/**
 * At most one insert target above and one below the viewport center.
 */
export interface ActiveInsertBoundaries {
  activeTopInsertAfter: number | null;
  activeBottomInsertAfter: number | null;
}

/**
 * Picks at most one boundary above and one below the viewport center.
 */
export function resolveActiveInsertBoundaries(
  boundaries: InsertBoundaryMetrics[],
  viewportHeight: number,
): ActiveInsertBoundaries {
  if (boundaries.length === 0 || viewportHeight <= 0) {
    return {
      activeTopInsertAfter: null,
      activeBottomInsertAfter: null,
    };
  }

  // Split point between the top and bottom mobile insert buttons.
  const center = viewportHeight / 2;

  // Nearest seam above center becomes the top insert target.
  const above = boundaries
    .filter((boundary) => boundary.top < center)
    .sort((a, b) => b.top - a.top);

  // Nearest seam below center becomes the bottom insert target.
  const below = boundaries
    .filter((boundary) => boundary.top >= center)
    .sort((a, b) => a.top - b.top);

  return {
    activeTopInsertAfter: above[0]?.insertAfter ?? null,
    activeBottomInsertAfter: below[0]?.insertAfter ?? null,
  };
}
