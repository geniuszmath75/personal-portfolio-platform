import { describe, it, expect } from "vitest";
import { useLoadingStore } from "../../../app/stores/loadingStore";
import BaseIndicator from "../../../app/components/BaseIndicator.vue";
import { createTestPinia, renderWithNuxt } from "../../setup";

describe("BaseIndicator", () => {
  it("should render hidden container when loading is false", () => {
    const pinia = createTestPinia();
    const loadingStore = useLoadingStore(pinia);

    loadingStore.loading = false;
    const { container } = renderWithNuxt(BaseIndicator, {
      global: { plugins: [pinia] },
    });

    const fixedDiv = container.querySelector("div.fixed");

    // Container exists
    expect(fixedDiv).toBeTruthy();
    // Container is hidden
    expect(fixedDiv).not.toBeVisible(); // v-show = false
  });

  it("should show container and LoadingAnimation when loading is true", () => {
    const pinia = createTestPinia();
    const loadingStore = useLoadingStore(pinia);

    loadingStore.loading = true;
    loadingStore.label = "Loading projects...";

    const { getByText, container } = renderWithNuxt(BaseIndicator, {
      global: { plugins: [pinia] },
    });

    const fixedDiv = container.querySelector("div.fixed");
    expect(fixedDiv).toBeVisible();

    // LoadingAnimation should render the label
    expect(getByText("Loading projects...")).toBeTruthy();
  });

  it("should update label reactively", async () => {
    const pinia = createTestPinia();
    const loadingStore = useLoadingStore(pinia);

    loadingStore.loading = true;
    loadingStore.label = "First label";

    const { getByText, rerender } = renderWithNuxt(BaseIndicator, {
      global: { plugins: [pinia] },
    });

    expect(getByText("First label")).toBeTruthy();

    // Update store state
    loadingStore.label = "Updated label";
    await rerender({});

    expect(getByText("Updated label")).toBeTruthy();
  });

  it("should include LoadingAnimation component", () => {
    const pinia = createTestPinia();
    const loadingStore = useLoadingStore(pinia);

    loadingStore.loading = true;

    const { container } = renderWithNuxt(BaseIndicator, {
      global: { plugins: [pinia] },
    });

    // Check if LoadingAnimation root element exists
    const loadingAnimation = container.querySelector(".animate-pulse");
    expect(loadingAnimation).toBeTruthy();
  });
});
