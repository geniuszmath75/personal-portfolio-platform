import { setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { createTestPinia } from "../../setup";
import { useLoadingStore } from "../../../app/stores/loadingStore";

describe("loadingStore", () => {
  beforeEach(() => {
    // Reset Pinia before each test
    setActivePinia(createTestPinia());
  });

  it("should have default state", () => {
    const store = useLoadingStore();
    expect(store.loading).toBe(false);
    expect(store.label).toBe("Loading...");
  });

  it("should 'startLoading' set loading to true with default label", () => {
    const store = useLoadingStore();
    store.startLoading();
    expect(store.loading).toBe(true);
    expect(store.label).toBe("Loading...");
  });

  it("should 'startLoading' set loading to true with custom label", () => {
    const store = useLoadingStore();
    store.startLoading("Please wait...");
    expect(store.loading).toBe(true);
    expect(store.label).toBe("Please wait...");
  });

  it("should 'finishLoading' set loading to false but does not reset label", () => {
    const store = useLoadingStore();
    store.startLoading("Custom");
    store.finishLoading();
    expect(store.loading).toBe(false);
    expect(store.label).toBe("Custom");
  });

  it("can handle multiple calls of start/finish", () => {
    const store = useLoadingStore();

    // Start loading
    store.startLoading("Step 1");
    expect(store.loading).toBe(true);
    expect(store.label).toBe("Step 1");

    // Finish loading
    store.finishLoading();
    expect(store.loading).toBe(false);

    // Start again with another label
    store.startLoading("Step 2");
    expect(store.loading).toBe(true);
    expect(store.label).toBe("Step 2");
  });
});
