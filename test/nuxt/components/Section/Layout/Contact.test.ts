import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/vue";
import { renderWithNuxt } from "~~/test/setup";
import Contact from "~/components/Section/Layout/Contact.vue";

describe("SectionLayoutContact", () => {
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

    renderWithNuxt(Contact, { props: { section } });

    expect(screen.getByText("Contact Me")).toBeTruthy();
    expect(screen.getByText("Get in touch")).toBeTruthy();
    expect(screen.getByText("Available anytime")).toBeTruthy();
    expect(screen.getByText("test@example.com")).toBeTruthy();
    expect(screen.getByText("+123456789")).toBeTruthy();

    const emailIcon = document.body.querySelector(".i-mdi\\:email");
    expect(emailIcon).toBeTruthy();

    const phoneIcon = document.body.querySelector(".i-mdi\\:phone");
    expect(phoneIcon).toBeTruthy();

    const linkedinLink = screen.getByRole("link", { name: "" });
    expect(linkedinLink.getAttribute("href")).toBe(
      "https://linkedin.com/testUser",
    );

    const linkedinIcon = document.body.querySelector(".i-mdi\\:linkedin");
    expect(linkedinIcon).toBeTruthy();
  });
});
