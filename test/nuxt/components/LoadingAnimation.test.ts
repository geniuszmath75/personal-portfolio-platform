import { describe, it, expect } from "vitest";
import { useLoadingStore } from "../../../app/stores/loadingStore.ts";
import LoadingAnimation from "../../../app/components/LoadingAnimation.vue";
import { createTestPinia, renderWithNuxt } from "../../setup";

describe("LoadingAnimation", () => {
  it("should render hidden container when loading is false", () => {
    const pinia = createTestPinia();
    const loadingStore = useLoadingStore(pinia);

    loadingStore.loading = false;
    const { container } = renderWithNuxt(LoadingAnimation, {
      global: { plugins: [pinia] },
    });

    const fixedDiv = container.querySelector("div.fixed");

    // Container exists
    expect(fixedDiv).toBeTruthy();
    // Container is hidden
    expect(fixedDiv).not.toBeVisible(); // v-show = false
  });

  it("shows spinner and label when loading is true", () => {
    const pinia = createTestPinia();
    const loadingStore = useLoadingStore(pinia);

    loadingStore.loading = true;
    loadingStore.label = "Fetching data...";
    const { getByText, container } = renderWithNuxt(LoadingAnimation, {
      global: { plugins: [pinia] },
    });

    // Container is visible
    expect(container.querySelector("div.fixed")).toBeVisible();

    // Loading icon exists
    expect(container.querySelector(".i-mdi\\:loading")).toBeTruthy();

    // Loading label exists
    expect(getByText("Fetching data...")).toBeTruthy();
  });

  it("updates label reactively when store changes", async () => {
    const pinia = createTestPinia();
    const loadingStore = useLoadingStore(pinia);

    loadingStore.loading = true;
    loadingStore.label = "Step 1";
    const { getByText, rerender } = renderWithNuxt(LoadingAnimation, {
      global: { plugins: [pinia] },
    });

    // Loading label is "Step 1"
    expect(getByText("Step 1")).toBeTruthy();

    loadingStore.label = "Step 2";
    await rerender({}); // forcing re-render

    // Updated loading label to "Step 2"
    expect(getByText("Step 2")).toBeTruthy();
  });
});
