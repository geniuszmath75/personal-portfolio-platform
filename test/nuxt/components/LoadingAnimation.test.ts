import { describe, it, expect } from "vitest";
import LoadingAnimation from "../../../app/components/LoadingAnimation.vue";
import { renderWithNuxt } from "../../setup";

describe("LoadingAnimation", () => {
  it("should show spinner and label", () => {
    const { getByText, container } = renderWithNuxt(LoadingAnimation, {
      props: { label: "Loading data..." },
    });

    // Container is visible
    expect(container.querySelector("div.flex.w-full")).toBeVisible();

    // Loading icon exists
    expect(container.querySelector(".i-mdi\\:loading")).toBeTruthy();

    // Loading label exists
    expect(getByText("Loading data...")).toBeTruthy();
  });
});
