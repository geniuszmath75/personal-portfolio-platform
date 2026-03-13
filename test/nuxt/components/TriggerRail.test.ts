import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent } from "@testing-library/vue";
import { renderWithNuxt } from "../../setup";
import TriggerRail from "../../../app/components/TriggerRail.vue";

const mockToggleSidebar = vi.fn();
let mockIsSidebarOpen = false;

vi.mock("~/composables/useDashboardSideNavbarState", () => ({
  useDashboardSideNavbarState: () => ({
    isSidebarOpen: mockIsSidebarOpen,
    toggleSidebar: mockToggleSidebar,
  }),
}));

describe("TriggerRail component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsSidebarOpen = false;
  });

  describe("rendering", () => {
    it("should render the component", () => {
      const { container } = renderWithNuxt(TriggerRail);

      expect(container.firstChild).not.toBeNull();
    });

    it("should render the chevron icon", () => {
      const { container } = renderWithNuxt(TriggerRail);

      const icon = container.querySelector(".i-mdi\\:chevron-right");

      expect(icon).not.toBeNull();
    });
  });

  describe("sidebar closed state", () => {
    it("should have 'left-0' class when sidebar is closed", () => {
      const { container } = renderWithNuxt(TriggerRail);

      expect(container.firstChild).toHaveClass("left-0");
    });
  });

  describe("sidebar open state", () => {
    it("should have 'left-72' class when sidebar is open", () => {
      mockIsSidebarOpen = true;

      const { container } = renderWithNuxt(TriggerRail);

      expect(container.firstChild).toHaveClass("left-72");
    });

    it("should have 'rotate-180' class on icon when sidebar is open", () => {
      mockIsSidebarOpen = true;

      const { container } = renderWithNuxt(TriggerRail);

      const icon = container.querySelector(".i-mdi\\:chevron-right");

      expect(icon).toHaveClass("rotate-180");
    });
  });

  describe("interactions", () => {
    it("should call toggleSidebar with true when sidebar is closed and clicked", async () => {
      const { container } = renderWithNuxt(TriggerRail);

      const rootDiv = container.querySelector("div") as HTMLElement;
      expect(rootDiv).toBeTruthy();

      await fireEvent.click(rootDiv);

      expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
      expect(mockToggleSidebar).toHaveBeenCalledWith(true);
    });

    it("should call toggleSidebar with false when sidebar is open and clicked", async () => {
      mockIsSidebarOpen = true;

      const { container } = renderWithNuxt(TriggerRail);

      const rootDiv = container.querySelector("div") as HTMLElement;
      expect(rootDiv).toBeTruthy();

      await fireEvent.click(rootDiv);

      expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
      expect(mockToggleSidebar).toHaveBeenCalledWith(false);
    });
  });
});
