import { describe, it, expect, vi } from "vitest";
import { renderWithNuxt } from "../../setup";
import BaseFilterBar from "../../../app/components/BaseFilterBar.vue";
import { fireEvent } from "@testing-library/vue";

describe("BaseFilterBar", () => {
  it("should render all variants as buttons", () => {
    // Arrange: provide variants and initial model value
    const variants = [5, 10, 20];
    const { getByText } = renderWithNuxt(BaseFilterBar, {
      props: {
        variants,
        limit: 5,
        "onUpdate:limit": vi.fn(),
      },
    });

    // Assert: all variants should be rendered as buttons
    variants.forEach((v) => {
      expect(getByText(String(v))).toBeInTheDocument();
    });
  });

  it("should highlight the active (currentLimit) button", () => {
    // Arrange: set initial limit = 10
    const variants = [5, 10, 20];
    const { getByText } = renderWithNuxt(BaseFilterBar, {
      props: {
        variants,
        limit: 10,
        "onUpdate:limit": vi.fn(),
      },
    });

    // Assert: button with currentLimit should have active class
    const activeBtn = getByText("10").closest("button");
    expect(activeBtn).toHaveClass("bg-additional-500");
  });

  it("should call 'changeLimit' and emit update when a button is clicked", async () => {
    // Arrange: spy on v-model update
    const updateSpy = vi.fn();
    const variants = [5, 10, 20];
    const { getByText } = renderWithNuxt(BaseFilterBar, {
      props: {
        variants,
        limit: 5,
        "onUpdate:limit": updateSpy,
      },
    });

    // Act: click on the "20" button
    await fireEvent.click(getByText("20"));

    // Assert: v-model update should be emitted with selected value
    expect(updateSpy).toHaveBeenCalledWith(20);
  });

  it("should render empty bar if variants array is empty", () => {
    // Arrange: render with no variants
    const { container } = renderWithNuxt(BaseFilterBar, {
      props: {
        variants: [],
        limit: 0,
        "onUpdate:limit": vi.fn(),
      },
    });

    // Assert: no buttons should be rendered
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });
});
