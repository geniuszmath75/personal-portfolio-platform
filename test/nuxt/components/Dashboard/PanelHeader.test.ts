import { describe, it, expect } from "vitest";
import { renderWithNuxt } from "../../../setup";
import DashboardPanelHeader from "../../../../app/components/Dashboard/PanelHeader.vue";

describe("DashboardPanelHeader component", () => {
  it("should render the component", () => {
    const { container } = renderWithNuxt(DashboardPanelHeader, {
      props: { title: "Test Title" },
    });

    expect(container.firstChild).not.toBeNull();
  });

  it("should render title prop", () => {
    const { getByText } = renderWithNuxt(DashboardPanelHeader, {
      props: { title: "Test Title" },
    });

    expect(getByText("Test Title")).not.toBeNull();
  });

  it("should render title inside h2 element", () => {
    const { container } = renderWithNuxt(DashboardPanelHeader, {
      props: { title: "Test Title" },
    });

    expect(container.querySelector("h2")).toHaveTextContent("Test Title");
  });
});
