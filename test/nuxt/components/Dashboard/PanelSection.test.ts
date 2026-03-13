import { describe, it, expect } from "vitest";
import { renderWithNuxt } from "../../../setup";
import DashboardPanelSection from "../../../../app/components/Dashboard/PanelSection.vue";

describe("DashboardPanelSection component", () => {
  describe("rendering", () => {
    it("should render the component", () => {
      const { container } = renderWithNuxt(DashboardPanelSection);

      expect(container.firstChild).not.toBeNull();
    });

    it("should render default slot content", () => {
      const { getByText } = renderWithNuxt(DashboardPanelSection, {
        slots: { default: "<p>Default content</p>" },
      });

      expect(getByText("Default content")).not.toBeNull();
    });

    it("should render actions slot when provided", () => {
      const { getByText } = renderWithNuxt(DashboardPanelSection, {
        slots: { actions: "<button>Save</button>" },
      });

      expect(getByText("Save")).not.toBeNull();
    });
  });

  describe("props", () => {
    it("should apply default containerClass", () => {
      const { container } = renderWithNuxt(DashboardPanelSection);

      expect(container.firstChild).toHaveClass("flex-col", "lg:flex-row");
    });

    it("should apply custom containerClass", () => {
      const { container } = renderWithNuxt(DashboardPanelSection, {
        props: { containerClass: "custom-container" },
      });

      expect(container.firstChild).toHaveClass("custom-container");
    });

    it("should apply default contentClass as empty string", () => {
      const { container } = renderWithNuxt(DashboardPanelSection);

      const content = container.querySelector(".flex-1");

      expect(content).not.toBeNull();
    });

    it("should apply custom contentClass", () => {
      const { container } = renderWithNuxt(DashboardPanelSection, {
        props: { contentClass: "custom-content" },
      });

      const content = container.querySelector(".flex-1");

      expect(content).toHaveClass("custom-content");
    });
  });
});
