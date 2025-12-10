import { describe, expect, it } from "vitest";
import { createTestPinia, renderWithNuxt } from "../../setup";
import AuthLayout from "../../../app/layouts/auth.vue";

describe("Auth layout", () => {
  const pinia = createTestPinia();

  it("should render layout structure", () => {
    const { container } = renderWithNuxt(AuthLayout, {
      global: {
        plugins: [pinia],
      },
      slots: {
        default: "<p>Authentication content</p>",
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
      "Authentication content",
    );
  });
});
