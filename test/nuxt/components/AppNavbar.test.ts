import { describe, it, expect } from "vitest";
import { fireEvent, screen } from "@testing-library/vue";
import { renderWithNuxt } from "../../setup";
import AppNavbar from "../../../app/components/AppNavbar.vue";

describe("AppNavbar", () => {
  it("renders static elements", () => {
    renderWithNuxt(AppNavbar);

    const githubIcon = document.body.querySelector(".i-mdi\\:github");

    // Navbar content should exist
    expect(githubIcon).toBeTruthy();
    expect(screen.getByText("HOME")).toBeTruthy();
    expect(screen.getByText("PROJECTS")).toBeTruthy();
    expect(screen.getByText("ABOUT")).toBeTruthy();
  });

  it("opens and closes account panel on click", async () => {
    renderWithNuxt(AppNavbar);

    const accountIcon = document.body.querySelector(
      ".i-mdi\\:user",
    ) as HTMLElement;
    expect(accountIcon).toBeTruthy();

    // Panel should not exist initially
    expect(screen.queryByText("LOG IN")).toBeNull();

    // Open panel
    await fireEvent.click(accountIcon);
    expect(screen.getByText("LOG IN")).toBeTruthy();

    // Close panel by clicking outside
    await fireEvent.click(document.body);
    expect(screen.queryByText("LOG IN")).toBeNull();
  });

  it("open and closes mobile menu with dedicated icons", async () => {
    renderWithNuxt(AppNavbar);

    // Initially closed
    expect(screen.queryAllByText("PROJECTS")[0]).toBeTruthy(); // visible on desktop
    expect(screen.queryByText("LOG IN")).toBeNull(); // mobile menu hidden

    const openButton = document.body.querySelector(
      ".i-mdi\\:menu",
    ) as HTMLElement;
    expect(openButton).toBeTruthy();

    // Click open icon
    await fireEvent.click(openButton);

    expect(screen.getByText("LOG IN")).toBeTruthy(); // mobile login visible

    const closeButton = document.body.querySelector(
      ".i-mdi\\:close",
    ) as HTMLElement;
    expect(closeButton).toBeTruthy();

    // Click close icon
    await fireEvent.click(closeButton);

    // Menu should be closed
    expect(screen.queryByText("LOG IN")).toBeNull();
  });

  it("closes mobile menu when a link is clicked", async () => {
    renderWithNuxt(AppNavbar);

    // Open menu
    const openButton = document.body.querySelector(
      ".i-mdi\\:menu",
    ) as HTMLElement;
    expect(openButton).toBeTruthy();

    await fireEvent.click(openButton);

    // Ensure that links are visible
    const aboutLink = screen.getAllByText("ABOUT")[1]; // 1 - mobile
    expect(aboutLink).toBeTruthy();

    // Click ABOUT link in mobile menu
    await fireEvent.click(aboutLink);

    // Menu should be closed
    expect(screen.queryByText("LOG IN")).toBeNull();
  });

  it("applies active class to current path link", () => {
    renderWithNuxt(AppNavbar, {
      global: {
        mocks: {
          $route: { path: "/about" },
        },
      },
    });

    const aboutLinks = screen.getAllByText("ABOUT");

    // Desktop (0) ABOUT link should have active class
    expect(aboutLinks[0].className).toContain("after:w-full");
  });
});
