import { renderWithNuxt, createTestPinia } from "../../setup";
import DefaultLayout from "../../../app/layouts/default.vue";
import { describe, expect, it } from "vitest";

describe("Default layout", () => {
  it("renders layout structure", () => {
    const pinia = createTestPinia();

    const { container } = renderWithNuxt(DefaultLayout, {
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
        default: "<p>Main content</p>",
      },
    });

    // wrapper
    expect(container.firstChild).toHaveClass(
      "flex",
      "min-h-screen",
      "flex-col",
      "font-default",
    );

    // slot
    expect(container.querySelector("main")?.textContent).toContain(
      "Main content",
    );

    // stubs
    expect(container.querySelector("nav")?.textContent).toBe("MockNavbar");
    expect(container.querySelector("footer")?.textContent).toBe("MockFooter");
  });

  it("should render slot content correctly", () => {
    const pinia = createTestPinia();

    const { getByText } = renderWithNuxt(DefaultLayout, {
      global: {
        plugins: [pinia],
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
