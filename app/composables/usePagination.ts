import type { PaginationProperties } from "~~/shared/types";

export function usePagination(
  currentPage: Ref<number>,
  pagination: Ref<Omit<PaginationProperties, "page">>,
) {
  /**
   * Computed list of pages to display in the pagination UI.
   * Includes numbers and `0` placeholders (used as "..." in the component).
   */
  const pages = computed(() => {
    const totalPages = pagination.value.totalPages;

    // Case 1: few pages -> show all
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Case 2: current page near the beginning -> show first 3, ellipsis, last
    if (currentPage.value < 3) {
      return [1, 2, 3, 0, totalPages];
    }

    // Case 3: current page near the end -> show first, ellipsis, last 3
    if (currentPage.value > totalPages - 2) {
      return [1, 0, totalPages - 2, totalPages - 1, totalPages];
    }

    // Case 4: current page in the middle -> show first, ellipsis, neighbors, ellipsis, last
    return [
      1,
      0,
      currentPage.value - 1,
      currentPage.value,
      currentPage.value + 1,
      0,
      totalPages,
    ];
  });

  /**
   * Changes active page if the provided value is valid.
   * Skips if the page is `null` or placeholder (`0`).
   */
  const goToPage = (page: number | null) => {
    if (!page) return;
    currentPage.value = page;
  };

  return { pages, goToPage };
}
