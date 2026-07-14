import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { screen } from "@testing-library/vue";
import { renderWithNuxt } from "~~/test/setup";
import SectionInsertBoundary from "~/components/Section/InsertBoundary.vue";
import {
  sectionInsertBoundariesKey,
  type SectionInsertBoundariesContext,
} from "~/composables/useSectionInsertBoundaries";

function createBoundaryContext(): SectionInsertBoundariesContext {
  return {
    activeTopInsertAfter: ref<number | null>(null),
    activeBottomInsertAfter: ref<number | null>(null),
    registerBoundary: vi.fn(),
    unregisterBoundary: vi.fn(),
  };
}

function renderBoundary(insertAfter = 1, context = createBoundaryContext()) {
  return {
    context,
    ...renderWithNuxt(SectionInsertBoundary, {
      props: { insertAfter },
      global: {
        provide: {
          [sectionInsertBoundariesKey]: context,
        },
      },
    }),
  };
}

describe("SectionInsertBoundary", () => {
  it("should render desktop seam link with insertAfter query", () => {
    renderBoundary(2);

    const link = screen.getByRole("link", {
      name: "Insert section after order 2",
    });

    expect(link).toHaveAttribute(
      "href",
      "/sections/create?placement=home&insertAfter=2",
    );
  });

  it("should register sentinel for scroll tracking", () => {
    const context = createBoundaryContext();
    const { container } = renderBoundary(1, context);

    expect(container.querySelector(".h-0")).toBeTruthy();
    expect(context.registerBoundary).toHaveBeenCalledWith(
      1,
      expect.any(HTMLElement),
    );
  });
});
