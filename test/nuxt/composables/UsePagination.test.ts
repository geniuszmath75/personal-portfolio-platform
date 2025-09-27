import { describe, expect, it } from "vitest";
import type { PaginationProperties } from "../../../shared/types/index";
import { ref } from "vue";
import { usePagination } from "../../../app/composables/usePagination";

describe("usePagination", () => {
  const testPagination: Omit<PaginationProperties, "page"> = {
    limit: 5,
    totalPages: 4,
    prevPage: null,
    nextPage: 2,
    totalDocuments: 20,
  };

  it("should show all pages when totalPages <= 5", () => {
    // ArrangeL totalPages = 4
    const currentPage = ref(1);
    const pagination = ref(testPagination);

    // Act: call composable
    const { pages } = usePagination(currentPage, pagination);

    // Assert: all pages [1, 2, 3, 4] are shown
    expect(pages.value).toEqual([1, 2, 3, 4]);
  });

  it("should show [1,2,3,0,last] when current page is near the beginning", () => {
    // Arrange: totalPages = 10, currentPage = 2
    const currentPage = ref(2);
    testPagination.totalPages = 10;

    const pagination = ref(testPagination);

    // Act
    const { pages } = usePagination(currentPage, pagination);

    // Assert: beginning case with ellipsis
    expect(pages.value).toEqual([1, 2, 3, 0, 10]);
  });

  it("should show [1,0,last-2,last-1,last] when current page is near the end", () => {
    // Arrange: totalPages = 10, currentPage = 9
    const currentPage = ref(9);
    testPagination.totalPages = 10;

    const pagination = ref(testPagination);

    // Act
    const { pages } = usePagination(currentPage, pagination);

    // Assert: end case with ellipsis
    expect(pages.value).toEqual([1, 0, 8, 9, 10]);
  });

  it("should show [1,0,prev,current,next,0,last] when current page is in the middle", () => {
    // Arrange: totalPages = 10, currentPage = 5
    const currentPage = ref(5);
    testPagination.totalPages = 10;

    const pagination = ref(testPagination);

    // Act
    const { pages } = usePagination(currentPage, pagination);

    // Assert: middle case with both ellipses
    expect(pages.value).toEqual([1, 0, 4, 5, 6, 0, 10]);
  });

  it("should not change page when goToPage is called with null or 0", () => {
    // Arrange
    const currentPage = ref(3);
    testPagination.totalPages = 5;

    const pagination = ref(testPagination);
    const { goToPage } = usePagination(currentPage, pagination);

    // Act: try invalid values
    goToPage(null);
    goToPage(0);

    // Assert: currentPage remains unchanged
    expect(currentPage.value).toBe(3);
  });

  it("should update currentPage when goToPage is called with a valid number", () => {
    // Arrange
    const currentPage = ref(3);
    testPagination.totalPages = 5;

    const pagination = ref(testPagination);
    const { goToPage } = usePagination(currentPage, pagination);

    // Act: go to page 4
    goToPage(4);

    // Assert: currentPage updated
    expect(currentPage.value).toBe(4);
  });

  it("should handle totalPages = 1 correctly", () => {
    // Arrange
    const currentPage = ref(1);
    testPagination.totalPages = 1;

    const pagination = ref(testPagination);

    // Act
    const { pages } = usePagination(currentPage, pagination);

    // Assert: only one page
    expect(pages.value).toEqual([1]);
  });
});
