import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/vue";
import { renderWithNuxt } from "~~/test/setup";
import Hero from "~/components/Section/Layout/Hero.vue";

describe("SectionLayoutHero", () => {
  it("renders HERO section with text, buttons and images", () => {
    const section = {
      type: "HERO",
      order: 1,
      blocks: [
        { kind: "PARAGRAPH", paragraphs: ["Welcome", "Subtext here"] },
        { kind: "BUTTON", buttons: ["PROJECTS", "ABOUT"] },
        {
          kind: "IMAGE",
          images: [
            {
              srcPath: "hero.png",
              altText: "hero image",
            },
          ],
        },
      ],
    };

    renderWithNuxt(Hero, { props: { section } });

    expect(screen.getByText("Welcome")).toBeTruthy();
    expect(screen.getByText("Subtext here")).toBeTruthy();

    expect(screen.getByText("PROJECTS").getAttribute("href")).toBe("/projects");
    expect(screen.getByText("ABOUT").getAttribute("href")).toBe("/about");

    expect(screen.getByAltText("hero image").getAttribute("src")).toBe(
      "/images/hero.png",
    );
  });

  it("renders uploaded image paths without legacy prefix", () => {
    const section = {
      type: "HERO",
      order: 1,
      blocks: [
        {
          kind: "IMAGE",
          images: [
            {
              srcPath: "/uploads/sections/hero.png",
              altText: "uploaded hero",
            },
          ],
        },
      ],
    };

    renderWithNuxt(Hero, { props: { section } });

    expect(screen.getByAltText("uploaded hero").getAttribute("src")).toBe(
      "/uploads/sections/hero.png",
    );
  });
});
