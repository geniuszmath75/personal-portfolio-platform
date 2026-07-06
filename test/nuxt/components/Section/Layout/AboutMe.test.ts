import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/vue";
import { renderWithNuxt } from "~~/test/setup";
import AboutMe from "~/components/Section/Layout/AboutMe.vue";

describe("SectionLayoutAboutMe", () => {
  it("renders about me section with title, tags, paragraphs and image", () => {
    const section = {
      type: "ABOUT_ME",
      order: 1,
      title: "About me",
      blocks: [
        {
          kind: "GROUP",
          items: [
            { icon: "mdi:map-marker", label: "Poland" },
            { icon: "mdi:briefcase", label: "Developer" },
          ],
        },
        {
          kind: "PARAGRAPH",
          paragraphs: ["Subtitle", "First paragraph", "Second paragraph"],
        },
        {
          kind: "IMAGE",
          images: [{ srcPath: "about.png", altText: "profile photo" }],
        },
      ],
    };

    renderWithNuxt(AboutMe, { props: { section } });

    expect(screen.getByText("About me")).toBeTruthy();
    expect(screen.getByText("Poland")).toBeTruthy();
    expect(screen.getByText("Developer")).toBeTruthy();
    expect(screen.getByText("Subtitle")).toBeTruthy();
    expect(screen.getByText("First paragraph")).toBeTruthy();
    expect(screen.getByText("Second paragraph")).toBeTruthy();
    expect(screen.getByAltText("profile photo").getAttribute("src")).toBe(
      "/images/about.png",
    );
  });
});
