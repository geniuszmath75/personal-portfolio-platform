import { describe, expect, it } from "vitest";
import { createTestPinia, renderWithNuxt } from "../../setup";
import DashboardLayout from "../../../app/layouts/dashboard.vue";

describe("Dashboard layout", () => {
  const pinia = createTestPinia();

  it("should render layout structure", () => {
    const { container } = renderWithNuxt(DashboardLayout, {
      global: {
        plugins: [pinia],
        stubs: {
          AppNavbar: {
            template: "<nav>MockNavbar</nav>",
          },
          AppFooter: {
            template: "<footer>MockFooter</footer>",
          },
        },
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

    // stubs
    expect(container.querySelector("nav")?.textContent).toBe("MockNavbar");
    expect(container.querySelector("footer")?.textContent).toBe("MockFooter");
  });

  it("should render slot content correctly", () => {
    const { getByText } = renderWithNuxt(DashboardLayout, {
      global: {
        stubs: {
          AppNavbar: true,
          AppFooter: true,
        },
      },
      slots: {
        default: "<span>Page body</span>",
      },
    });

    expect(getByText("Page body")).toBeVisible();
  });
});
