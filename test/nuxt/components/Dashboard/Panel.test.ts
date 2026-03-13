import { describe, it, expect } from "vitest";
import { renderWithNuxt } from "../../../setup";
import DashboardPanel from "../../../../app/components/Dashboard/Panel.vue";

describe("DashboardPanel component", () => {
  it("should render the component", () => {
    const { container } = renderWithNuxt(DashboardPanel);

    expect(container.firstChild).not.toBeNull();
  });

  it("should render default slot content", () => {
    const { getByText } = renderWithNuxt(DashboardPanel, {
      slots: { default: "<p>Panel content</p>" },
    });

    expect(getByText("Panel content")).not.toBeNull();
  });
});
