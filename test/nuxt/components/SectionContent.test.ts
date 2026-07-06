import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/vue";
import { renderWithNuxt } from "../../setup";
import SectionContent from "../../../app/components/SectionContent.vue";

describe("SectionContent", () => {
  it("applies primary background and delegates rendering to the hero layout", () => {
    const section = {
      type: "HERO",
      order: 1,
      blocks: [{ kind: "PARAGRAPH", paragraphs: ["Hello hero"] }],
    };

    const { container } = renderWithNuxt(SectionContent, {
      props: { section },
    });

    const wrapper = container.querySelector("section");
    expect(wrapper?.className).toContain("bg-primary-500");
    expect(wrapper?.className).not.toContain("bg-secondary-500");
    expect(screen.getByText("Hello hero")).toBeTruthy();
  });

  it("applies secondary background for even order values", () => {
    const section = {
      type: "SKILLS",
      order: 2,
      title: "Skills",
      blocks: [{ kind: "PARAGRAPH", paragraphs: ["Skill text"] }],
    };

    const { container } = renderWithNuxt(SectionContent, {
      props: { section },
    });

    const wrapper = container.querySelector("section");
    expect(wrapper?.className).toContain("bg-secondary-500");
    expect(screen.getByText("Skills")).toBeTruthy();
    expect(screen.getByText("Skill text")).toBeTruthy();
  });

  it("delegates to fallback layout for unknown section types", () => {
    const section = {
      type: "UNKNOWN",
      order: 3,
      blocks: [],
    };

    renderWithNuxt(SectionContent, { props: { section } });

    expect(screen.getByText("New section soon: UNKNOWN")).toBeTruthy();
  });
});
