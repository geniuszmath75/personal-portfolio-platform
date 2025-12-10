import { describe, expect, it } from "vitest";
import { createTestPinia, renderWithNuxt } from "../../setup";
import DashboardLayout from "../../../app/layouts/dashboard.vue";

describe("Dashboard layout", () => {
  const pinia = createTestPinia();

  it("should render layout structure", () => {
    const { container } = renderWithNuxt(DashboardLayout, {
      global: {
        plugins: [pinia],
      },
      slots: {
        default: "<p>Dashboard content</p>",
      },
    });

    // wrapper
    expect(container.firstChild).toHaveClass(
      "flex",
      "min-h-screen",
      "font-default",
      "bg-primary-500",
    );

    // slot
    expect(container.querySelector("main")?.textContent).toContain(
      "Dashboard content",
    );
  });
});
