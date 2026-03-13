import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent } from "@testing-library/vue";
import { renderWithNuxt } from "../../../setup";
import DashboardSideNavbar from "../../../../app/components/Dashboard/SideNavbar.vue";
import type { SidebarLink } from "~/types/components";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

const mockToggleSidebar = vi.fn();
const mockToggleDropdownMenu = vi.fn();
const mockIsDropdownMenuOpen = vi.fn();
const mockRoute = { path: "/" };

let mockIsSidebarOpen = false;
let mockSidebarVisibilityClass = "-translate-x-full";

mockNuxtImport("useRoute", () => () => mockRoute);

vi.mock("~/composables/useDashboardSideNavbar", () => ({
  useDashboardSideNavbar: vi.fn(() => ({
    isSidebarOpen: mockIsSidebarOpen,
    toggleSidebar: mockToggleSidebar,
    isDropdownMenuOpen: mockIsDropdownMenuOpen,
    toggleDropdownMenu: mockToggleDropdownMenu,
    sidebarVisibilityClass: mockSidebarVisibilityClass,
  })),
}));

vi.mock("~/config/adminDashboardLinks", () => ({
  adminDashboardlinks: [
    {
      id: 1,
      label: "Dashboard",
      type: "link",
      to: "/dashboard",
      icon: "mdi:home",
    },
    {
      id: 2,
      label: "Settings",
      type: "dropdown",
      icon: "mdi:cog",
      children: [
        { id: 21, label: "Profile", to: "/dashboard/profile" },
        { id: 22, label: "Security", to: "/dashboard/security" },
      ],
    },
  ] as SidebarLink[],
}));

describe("DashboardSideNavbar component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDropdownMenuOpen.mockReturnValue(false);
    mockIsSidebarOpen = false;
    mockSidebarVisibilityClass = "-translate-x-full";
    mockRoute.path = "/";
  });

  describe("rendering", () => {
    it("should render aside element", () => {
      const { container } = renderWithNuxt(DashboardSideNavbar);

      expect(container.querySelector("aside")).not.toBeNull();
    });

    it("should render link type navigation item", () => {
      const { getByText } = renderWithNuxt(DashboardSideNavbar);

      expect(getByText("Dashboard")).not.toBeNull();
    });

    it("should render dropdown type navigation item", () => {
      const { getByText } = renderWithNuxt(DashboardSideNavbar);

      expect(getByText("Settings")).not.toBeNull();
    });

    it("should not render overlay when sidebar is closed", () => {
      const { container } = renderWithNuxt(DashboardSideNavbar);

      const overlay = container.querySelector(".fixed.inset-0");

      expect(overlay).toBeNull();
    });

    it("should render overlay when sidebar is open", () => {
      mockIsSidebarOpen = true;
      mockSidebarVisibilityClass = "translate-x-0";

      const { container } = renderWithNuxt(DashboardSideNavbar);

      const overlay = container.querySelector(".fixed.inset-0");

      expect(overlay).not.toBeNull();
    });

    it("should not render dropdown children when dropdown is closed", () => {
      const { queryByText } = renderWithNuxt(DashboardSideNavbar);

      expect(queryByText("Profile")).toBeNull();
      expect(queryByText("Security")).toBeNull();
    });

    it("should render dropdown children when dropdown is open", () => {
      mockIsDropdownMenuOpen.mockImplementation((id: number) => id === 2);

      const { getByText } = renderWithNuxt(DashboardSideNavbar);

      expect(getByText("Profile")).not.toBeNull();
      expect(getByText("Security")).not.toBeNull();
    });
  });

  describe("sidebarVisibilityClass", () => {
    it("should apply '-translate-x-full' class when sidebar is closed", () => {
      const { container } = renderWithNuxt(DashboardSideNavbar);

      expect(container.querySelector("aside")).toHaveClass("-translate-x-full");
    });

    it("should apply 'translate-x-0' class when sidebar is open", () => {
      mockIsSidebarOpen = true;
      mockSidebarVisibilityClass = "translate-x-0";

      const { container } = renderWithNuxt(DashboardSideNavbar);

      expect(container.querySelector("aside")).toHaveClass("translate-x-0");
    });
  });

  describe("computeBtnStyleProp", () => {
    it("should apply 'sidebar--additional' style for active route link", () => {
      mockRoute.path = "/dashboard";

      const { getByText } = renderWithNuxt(DashboardSideNavbar);

      const btn = getByText("Dashboard").closest("button");

      expect(btn).toHaveClass("bg-additional-500");
    });

    it("should apply 'sidebar--secondary' style for inactive route link", () => {
      mockRoute.path = "/";

      const { getByText } = renderWithNuxt(DashboardSideNavbar);

      const btn = getByText("Dashboard").closest("button");

      expect(btn).toHaveClass("bg-secondary-500");
    });
  });

  describe("interactions", () => {
    it("should call toggleSidebar(false) when overlay is clicked", async () => {
      mockIsSidebarOpen = true;
      mockSidebarVisibilityClass = "translate-x-0";

      const { container } = renderWithNuxt(DashboardSideNavbar);

      await fireEvent.click(container.querySelector(".fixed.inset-0")!);

      expect(mockToggleSidebar).toHaveBeenCalledWith(false);
    });

    it("should call toggleSidebar(false) when link is clicked", async () => {
      const { getByText } = renderWithNuxt(DashboardSideNavbar);

      await fireEvent.click(getByText("Dashboard"));

      expect(mockToggleSidebar).toHaveBeenCalledWith(false);
    });

    it("should call toggleDropdownMenu with link id when dropdown button is clicked", async () => {
      const { getByText } = renderWithNuxt(DashboardSideNavbar);

      await fireEvent.click(getByText("Settings"));

      expect(mockToggleDropdownMenu).toHaveBeenCalledWith(2);
    });

    it("should call toggleSidebar(false) when dropdown child link is clicked", async () => {
      mockIsDropdownMenuOpen.mockImplementation((id: number) => id === 2);

      const { getByText } = renderWithNuxt(DashboardSideNavbar);

      await fireEvent.click(getByText("Profile"));

      expect(mockToggleSidebar).toHaveBeenCalledWith(false);
    });
  });

  describe("chevron icon rotation", () => {
    it("should not rotate chevron icon when dropdown is closed", () => {
      const { container } = renderWithNuxt(DashboardSideNavbar);

      const icon = container.querySelector(".i-mdi\\:chevron-down");

      expect(icon).not.toHaveClass("rotate-180");
    });

    it("should rotate chevron icon when dropdown is open", () => {
      mockIsDropdownMenuOpen.mockImplementation((id: number) => id === 2);

      const { container } = renderWithNuxt(DashboardSideNavbar);

      const icon = container.querySelector(".i-mdi\\:chevron-down");

      expect(icon).toHaveClass("rotate-180");
    });
  });
});
