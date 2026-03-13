import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "vue-composable-tester";
import { useDashboardSideNavbar } from "../../../app/composables/useDashboardSideNavbar";
import type { SidebarLink } from "~/types/components";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

const mockRoute = { path: "/" };

mockNuxtImport("useRoute", () => () => mockRoute);

const { mockUseDashboardSideNavbarState } = vi.hoisted(() => ({
  mockUseDashboardSideNavbarState: vi.fn(() => ({
    isSidebarOpen: { value: false },
    toggleSidebar: vi.fn(),
  })),
}));

vi.mock("../../../app/composables/useDashboardSideNavbarState", () => ({
  useDashboardSideNavbarState: mockUseDashboardSideNavbarState,
}));

const mockLinks: SidebarLink[] = [
  {
    id: 1,
    label: "Home",
    type: "link",
    to: "/dashboard",
  },
  {
    id: 2,
    label: "Settings",
    type: "dropdown",
    children: [
      { id: 21, label: "Profile", to: "/dashboard/profile" },
      { id: 22, label: "Security", to: "/dashboard/security" },
    ],
  },
  {
    id: 3,
    label: "Reports",
    type: "dropdown",
    children: [{ id: 31, label: "Monthly", to: "/dashboard/reports/monthly" }],
  },
];

describe("useDashboardSideNavbar", () => {
  beforeEach(() => {
    mockRoute.path = "/";
    vi.clearAllMocks();
  });

  describe("isDropdownMenuOpen", () => {
    it("should return false for all dropdowns initially when route has no match", () => {
      const { result } = mount(() => useDashboardSideNavbar(mockLinks));

      expect(result.isDropdownMenuOpen(2)).toBe(false);
      expect(result.isDropdownMenuOpen(3)).toBe(false);
    });

    it("should return true for dropdown that matches current route on init", () => {
      mockRoute.path = "/dashboard/profile";

      const { result } = mount(() => useDashboardSideNavbar(mockLinks));

      expect(result.isDropdownMenuOpen(2)).toBe(true);
    });

    it("should return false for dropdown that does not match current route", () => {
      mockRoute.path = "/dashboard/profile";

      const { result } = mount(() => useDashboardSideNavbar(mockLinks));

      expect(result.isDropdownMenuOpen(3)).toBe(false);
    });

    it("should return false when dropdown children are undefined", () => {
      const linksWithNoChildren: SidebarLink[] = [
        {
          id: 1,
          label: "Home",
          type: "dropdown",
          children: null,
        } as unknown as SidebarLink,
      ];

      mockRoute.path = "/dashboard";

      const { result } = mount(() =>
        useDashboardSideNavbar(linksWithNoChildren),
      );

      expect(result.isDropdownMenuOpen(1)).toBe(false);
    });
  });

  describe("toggleDropdownMenu", () => {
    it("should open dropdown when toggled", () => {
      const { result } = mount(() => useDashboardSideNavbar(mockLinks));

      result.toggleDropdownMenu(2);

      expect(result.isDropdownMenuOpen(2)).toBe(true);
    });

    it("should close dropdown when toggled twice", () => {
      const { result } = mount(() => useDashboardSideNavbar(mockLinks));

      result.toggleDropdownMenu(2);
      result.toggleDropdownMenu(2);

      expect(result.isDropdownMenuOpen(2)).toBe(false);
    });

    it("should close previously opened dropdown when another is toggled", () => {
      const { result } = mount(() => useDashboardSideNavbar(mockLinks));

      result.toggleDropdownMenu(2);
      result.toggleDropdownMenu(3);

      expect(result.isDropdownMenuOpen(2)).toBe(false);
      expect(result.isDropdownMenuOpen(3)).toBe(true);
    });
  });

  describe("sidebarVisibilityClass", () => {
    it("should return '-translate-x-full' when sidebar is closed", () => {
      const { result } = mount(() => useDashboardSideNavbar(mockLinks));

      expect(result.sidebarVisibilityClass.value).toBe("-translate-x-full");
    });

    it("should return 'translate-x-0' when sidebar is open", () => {
      mockUseDashboardSideNavbarState.mockReturnValueOnce({
        isSidebarOpen: { value: true },
        toggleSidebar: vi.fn(),
      });

      const { result } = mount(() => useDashboardSideNavbar(mockLinks));

      expect(result.sidebarVisibilityClass.value).toBe("translate-x-0");
    });
  });
});
