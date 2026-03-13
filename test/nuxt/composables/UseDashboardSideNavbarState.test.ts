import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "vue-composable-tester";
import { useDashboardSideNavbarState } from "../../../app/composables/useDashboardSideNavbarState";

describe("useDashboardSideNavbarState composable", () => {
  beforeEach(() => {
    // Reset shared state between tests
    const { result } = mount(() => useDashboardSideNavbarState());
    result.toggleSidebar(false);
  });

  it("should initialize with sidebar closed", () => {
    const { result } = mount(() => useDashboardSideNavbarState());

    expect(result.isSidebarOpen.value).toBe(false);
  });

  it("should open sidebar when toggleSidebar is called with true", () => {
    const { result } = mount(() => useDashboardSideNavbarState());

    result.toggleSidebar(true);

    expect(result.isSidebarOpen.value).toBe(true);
  });

  it("should close sidebar when toggleSidebar is called with false", () => {
    const { result } = mount(() => useDashboardSideNavbarState());

    result.toggleSidebar(true);
    result.toggleSidebar(false);

    expect(result.isSidebarOpen.value).toBe(false);
  });

  it("should share state between multiple instances", () => {
    const { result: instance1 } = mount(() => useDashboardSideNavbarState());
    const { result: instance2 } = mount(() => useDashboardSideNavbarState());

    instance1.toggleSidebar(true);

    expect(instance2.isSidebarOpen.value).toBe(true);
  });
});
