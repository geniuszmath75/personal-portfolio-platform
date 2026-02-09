import { describe, it, expect } from "vitest";
import type { PaginationProperties } from "../../../shared/types/index";
import { renderWithNuxt } from "../../setup";
import BasePagination from "../../../app/components/BasePagination.vue";
import { fireEvent } from "@testing-library/vue";
import { ref } from "vue";

describe("BasePagination", () => {
  it("should render all pages when totalPages <= 5", () => {
    // Arrange: small pagination (4 pages)
    const pagination: Omit<PaginationProperties, "page"> = {
      limit: 5,
      prevPage: null,
      nextPage: 2,
      totalDocuments: 20,
      totalPages: 4,
    };

    // Act: render component
    const { getByText } = renderWithNuxt(BasePagination, {
      props: { pagination },
    });

    // Assert: all page buttons rendered
    expect(getByText("1")).toBeTruthy();
    expect(getByText("4")).toBeTruthy();
  });

  it("should render beginning case with ellipsis when current page < 3", () => {
    // Arrange: 10 total pages, start at page 2
    const pagination: Omit<PaginationProperties, "page"> = {
      limit: 5,
      prevPage: 1,
      nextPage: 3,
      totalDocuments: 50,
      totalPages: 10,
    };

    // Act
    const { getByText, queryByText } = renderWithNuxt(BasePagination, {
      props: { pagination, page: 2 },
    });

    // Assert
    expect(getByText("1")).toBeTruthy();
    expect(getByText("3")).toBeTruthy();
    expect(getByText("...")).toBeTruthy();
    expect(getByText("10")).toBeTruthy();
    expect(queryByText("5")).toBeNull(); // not visible
  });

  it("should render ending case with ellipsis when current page near the end", () => {
    // Arrange: 10 total pages, current page = 9
    const pagination: Omit<PaginationProperties, "page"> = {
      limit: 5,
      prevPage: 8,
      nextPage: 10,
      totalDocuments: 50,
      totalPages: 10,
    };

    // Act
    const { getByText, queryByText } = renderWithNuxt(BasePagination, {
      props: { pagination, page: 9 },
    });

    // Assert
    expect(getByText("10")).toBeTruthy();
    expect(getByText("...")).toBeTruthy();
    expect(getByText("8")).toBeTruthy();
    expect(queryByText("4")).toBeNull();
  });

  it("should render middle case with ellipses on both sides", () => {
    // Arrange: 10 pages, current page = 5
    const pagination: Omit<PaginationProperties, "page"> = {
      limit: 5,
      prevPage: 4,
      nextPage: 6,
      totalDocuments: 50,
      totalPages: 10,
    };

    // Act
    const { getByText, queryAllByText } = renderWithNuxt(BasePagination, {
      props: { pagination, page: 5 },
    });

    // Assert
    expect(queryAllByText("...").length).toBe(2); // both sides
    expect(getByText("4")).toBeTruthy();
    expect(getByText("6")).toBeTruthy();
    expect(getByText("10")).toBeTruthy();
  });

  it("should disable prev button on first page", () => {
    // Arrange: on page 1
    const pagination: Omit<PaginationProperties, "page"> = {
      limit: 5,
      prevPage: null,
      nextPage: 2,
      totalDocuments: 50,
      totalPages: 10,
    };

    // Act
    const { container } = renderWithNuxt(BasePagination, {
      props: { pagination, page: 1 },
    });

    // Assert
    const prevButton = container.querySelectorAll("button")[0];
    expect(prevButton).toHaveAttribute("disabled");
  });

  it("should disable next button on last page", () => {
    // Arrange: on last page
    const pagination: Omit<PaginationProperties, "page"> = {
      limit: 5,
      prevPage: 9,
      nextPage: null,
      totalDocuments: 50,
      totalPages: 10,
    };

    // Act
    const { container } = renderWithNuxt(BasePagination, {
      props: { pagination, page: 10 },
    });

    // Assert
    const nextButton =
      container.querySelectorAll("button")[
        container.querySelectorAll("button").length - 1
      ];
    expect(nextButton).toHaveAttribute("disabled");
  });

  it("should highlight the active page", () => {
    // Arrange: current page = 3
    const pagination: Omit<PaginationProperties, "page"> = {
      limit: 5,
      prevPage: 2,
      nextPage: 4,
      totalDocuments: 25,
      totalPages: 5,
    };

    // Act
    const { getByText } = renderWithNuxt(BasePagination, {
      props: { pagination, page: 3 },
    });

    // Assert: page 3 button has highlight class
    const activePage = getByText("3");
    expect(activePage.className).toContain("border-additional-500");
  });

  it("should change page when clicking prev button", async () => {
    // Arrange: on page 2
    const pagination: Omit<PaginationProperties, "page"> = {
      limit: 5,
      prevPage: 1,
      nextPage: null,
      totalDocuments: 10,
      totalPages: 2,
    };
    const currentPage = ref(2);

    // Act
    const { container } = renderWithNuxt(BasePagination, {
      props: {
        pagination,
        page: currentPage.value,
        "onUpdate:page": (e: number) => (currentPage.value = e),
      },
    });
    const prevButton = container.querySelectorAll("button")[0];

    expect(prevButton).toBeDefined();
    await fireEvent.click(prevButton!);

    // Assert: currentPage updated
    expect(currentPage.value).toBe(1);
  });

  it("should change page when clicking next button", async () => {
    // Arrange: on page 1
    const pagination: Omit<PaginationProperties, "page"> = {
      limit: 5,
      prevPage: null,
      nextPage: 2,
      totalDocuments: 20,
      totalPages: 4,
    };
    const currentPage = ref(1);

    // Act
    const { container } = renderWithNuxt(BasePagination, {
      props: {
        pagination,
        page: currentPage.value,
        "onUpdate:page": (e: number) => (currentPage.value = e),
      },
    });
    const nextButton =
      container.querySelectorAll("button")[
        container.querySelectorAll("button").length - 1
      ];

    expect(nextButton).toBeDefined();
    await fireEvent.click(nextButton!);

    // Assert: currentPage updated
    expect(currentPage.value).toBe(2);
  });

  it("should change page when clicking a page button", async () => {
    // Arrange: total 4 pages, current = 1
    const pagination: Omit<PaginationProperties, "page"> = {
      limit: 5,
      prevPage: null,
      nextPage: 2,
      totalDocuments: 20,
      totalPages: 4,
    };
    const currentPage = ref(1);

    // Act
    const { getByText } = renderWithNuxt(BasePagination, {
      props: {
        pagination,
        page: currentPage.value,
        "onUpdate:page": (e: number) => (currentPage.value = e),
      },
    });
    await fireEvent.click(getByText("3"));

    // Assert: currentPage updated
    expect(currentPage.value).toBe(3);
  });
});
