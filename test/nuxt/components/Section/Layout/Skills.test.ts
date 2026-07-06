import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/vue";
import { renderWithNuxt } from "~~/test/setup";
import Skills from "~/components/Section/Layout/Skills.vue";

describe("SectionLayoutSkills", () => {
  it("renders SKILLS section with title, paragraphs and groups", () => {
    const section = {
      type: "SKILLS",
      order: 2,
      title: "My Skills",
      blocks: [
        {
          kind: "PARAGRAPH",
          paragraphs: ["Subtext one", "Subtext two"],
        },
        {
          kind: "GROUP",
          header: "FRONTEND",
          items: [
            {
              icon: "mdi:language-javascript",
              label: "JavaScript",
            },
            {
              icon: "mdi:language-typescript",
              label: "TypeScript",
            },
            { icon: "mdi:language-css", label: "CSS" },
          ],
        },
      ],
    };

    renderWithNuxt(Skills, { props: { section } });

    expect(screen.getByText("My Skills")).toBeTruthy();
    expect(screen.getByText("Subtext one")).toBeTruthy();
    expect(screen.getByText("Subtext two")).toBeTruthy();
    expect(screen.getByText("FRONTEND")).toBeTruthy();
    expect(screen.getByText("JavaScript")).toBeTruthy();
    expect(screen.getByText("TypeScript")).toBeTruthy();
    expect(screen.getByText("CSS")).toBeTruthy();

    const jsIcon = document.body.querySelector(".i-mdi\\:language-javascript");
    expect(jsIcon).toBeTruthy();

    const typescriptIcon = document.body.querySelector(
      ".i-mdi\\:language-typescript",
    );
    expect(typescriptIcon).toBeTruthy();

    const cssIcon = document.body.querySelector(".i-mdi\\:language-css");
    expect(cssIcon).toBeTruthy();
  });
});
