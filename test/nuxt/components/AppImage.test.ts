import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/vue";
import { renderWithNuxt } from "~~/test/setup";
import AppImage from "~/components/AppImage.vue";

describe("AppImage", () => {
  it("should render the image when NuxtImg reports loaded", () => {
    renderWithNuxt(AppImage, {
      props: {
        src: "/uploads/projects/photo.jpg",
        alt: "project photo",
        rootClass: "h-40 w-full",
      },
    });

    const img = screen.getByRole("img", { name: "project photo" });
    expect(img).toHaveAttribute("src", "/uploads/projects/photo.jpg");
    expect(img).toHaveClass("opacity-100");
  });

  it("should show pulsing placeholder while image is loading", () => {
    const { container } = renderWithNuxt(AppImage, {
      props: {
        src: "/uploads/projects/photo.jpg",
        alt: "loading photo",
        rootClass: "h-40 w-full",
      },
      global: {
        stubs: {
          NuxtImg: {
            props: [
              "src",
              "alt",
              "preset",
              "sizes",
              "loading",
              "width",
              "height",
              "custom",
            ],
            template: `
              <slot
                :src="src"
                :isLoaded="false"
                :imgAttrs="{ alt }"
              />
            `,
          },
        },
      },
    });

    const img = screen.getByRole("img", { name: "loading photo" });
    expect(img).toHaveClass("opacity-0");
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });
});
