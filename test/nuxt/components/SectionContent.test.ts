import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/vue";
import { renderWithNuxt } from "../../setup";
import SectionContent from "../../../app/components/SectionContent.vue";

describe("SectionContent", () => {
  it("renders HERO section with text, buttons and images", () => {
    const section = {
      type: "HERO",
      order: 1,
      blocks: [
        { kind: "PARAGRAPH", paragraphs: ["Welcome", "Subtext here"] },
        { kind: "BUTTON", buttons: ["PROJECTS", "ABOUT"] },
        { kind: "IMAGE", images: ["hero.png"] },
      ],
    };

    renderWithNuxt(SectionContent, { props: { section } });

    // Paragraphs
    expect(screen.getByText("Welcome")).toBeTruthy();
    expect(screen.getByText("Subtext here")).toBeTruthy();

    // Buttons
    expect(screen.getByText("PROJECTS").getAttribute("href")).toBe("/projects");
    expect(screen.getByText("ABOUT").getAttribute("href")).toBe("/about");

    // Image
    expect(screen.getByAltText("hero.png").getAttribute("src")).toBe(
      "/images/hero.png",
    );
  });

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

    renderWithNuxt(SectionContent, { props: { section } });

    // Title
    expect(screen.getByText("My Skills")).toBeTruthy();

    // Paragraphs
    expect(screen.getByText("Subtext one")).toBeTruthy();
    expect(screen.getByText("Subtext two")).toBeTruthy();

    // Group header
    expect(screen.getByText("FRONTEND")).toBeTruthy();

    // Group items:
    // Labels
    expect(screen.getByText("JavaScript")).toBeTruthy();
    expect(screen.getByText("TypeScript")).toBeTruthy();
    expect(screen.getByText("CSS")).toBeTruthy();

    // Icons
    const jsIcon = document.body.querySelector(".i-mdi\\:language-javascript");
    expect(jsIcon).toBeTruthy();

    const typescriptIcon = document.body.querySelector(
      ".i-mdi\\:language-typescript",
    );
    expect(typescriptIcon).toBeTruthy();

    const cssIcon = document.body.querySelector(".i-mdi\\:language-css");
    expect(cssIcon).toBeTruthy();
  });

  it("renders CONTACT section with title, paragraphs and contact details", () => {
    const section = {
      type: "CONTACT",
      order: 3,
      title: "Contact Me",
      blocks: [
        {
          kind: "PARAGRAPH",
          paragraphs: ["Get in touch", "Available anytime"],
        },
        {
          kind: "GROUP",
          items: [
            { icon: "mdi:email", label: "test@example.com" },
            { icon: "mdi:phone", label: "+123456789" },
            {
              icon: "mdi:linkedin",
              label: "https://linkedin.com/testUser",
            },
          ],
        },
      ],
    };

    renderWithNuxt(SectionContent, { props: { section } });

    // Title
    expect(screen.getByText("Contact Me")).toBeTruthy();

    // Paragraphs
    expect(screen.getByText("Get in touch")).toBeTruthy();
    expect(screen.getByText("Available anytime")).toBeTruthy();

    // Contact items:
    // Non-link labels
    expect(screen.getByText("test@example.com")).toBeTruthy();
    expect(screen.getByText("+123456789")).toBeTruthy();

    // Non-link icons
    const emailIcon = document.body.querySelector(".i-mdi\\:email");
    expect(emailIcon).toBeTruthy();

    const phoneIcon = document.body.querySelector(".i-mdi\\:phone");
    expect(phoneIcon).toBeTruthy();

    // Social link
    const linkedinLink = screen.getByRole("link", { name: "" }); // Icon stub -> no text
    expect(linkedinLink.getAttribute("href")).toBe(
      "https://linkedin.com/testUser",
    );

    // Social icon
    const linkedinIcon = document.body.querySelector(".i-mdi\\:linkedin");
    expect(linkedinIcon).toBeTruthy();
  });

  it("renders fallback section for unknown type", () => {
    const section = {
      type: "UNKNOWN",
      order: 4,
      blocks: [],
    };

    renderWithNuxt(SectionContent, { props: { section } });

    expect(screen.getByText("New section soon: UNKNOWN")).toBeTruthy();
  });
});
