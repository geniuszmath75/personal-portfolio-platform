import { describe, it, expect } from "vitest";
import { renderWithNuxt } from "../../../setup";
import DashboardPanelField from "../../../../app/components/Dashboard/FormField.vue";

describe("DashboardFormField component", () => {
  it("should render the component", () => {
    const { container } = renderWithNuxt(DashboardPanelField, {
      props: { label: "Test Label" },
    });

    expect(container.firstChild).not.toBeNull();
  });

  it("should render label prop", () => {
    const { getByText } = renderWithNuxt(DashboardPanelField, {
      props: { label: "Test Label" },
    });

    expect(getByText("Test Label")).not.toBeNull();
  });

  it("should render label inside h3 element", () => {
    const { container } = renderWithNuxt(DashboardPanelField, {
      props: { label: "Test Label" },
    });

    expect(container.querySelector("h3")).toHaveTextContent("Test Label");
  });

  it("should render default slot content", () => {
    const { getByText } = renderWithNuxt(DashboardPanelField, {
      props: { label: "Test Label" },
      slots: { default: "<p>Field content</p>" },
    });

    expect(getByText("Field content")).not.toBeNull();
  });
});
