import { describe, it, expect, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/vue";
import { createTestPinia, renderWithNuxt } from "../../setup";
import AppNavbar from "../../../app/components/AppNavbar.vue";
import { useAuthStore } from "../../../app/stores/authStore";
import { UserSchemaRole } from "~~/server/types/enums";

describe("AppNavbar", () => {
  it("should render static elements", () => {
    renderWithNuxt(AppNavbar);

    const githubIcon = document.body.querySelector(".i-mdi\\:github");

    // Navbar content should exist
    expect(githubIcon).toBeTruthy();
    expect(screen.getByText("HOME")).toBeTruthy();
    expect(screen.getByText("PROJECTS")).toBeTruthy();
    expect(screen.getByText("ABOUT ME")).toBeTruthy();
  });

  it("should open and close account panel on click", async () => {
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

  it("should open and close mobile menu with dedicated icons", async () => {
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

  it("should close mobile menu when a link is clicked", async () => {
    renderWithNuxt(AppNavbar);

    // Open menu
    const openButton = document.body.querySelector(
      ".i-mdi\\:menu",
    ) as HTMLElement;
    expect(openButton).toBeTruthy();

    await fireEvent.click(openButton);

    // Ensure that links are visible
    const aboutLink = screen.getAllByText("ABOUT ME")[1]; // 1 - mobile
    expect(aboutLink).toBeDefined();

    // Click ABOUT link in mobile menu
    await fireEvent.click(aboutLink!);

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

    const aboutLinks = screen.getAllByText("ABOUT ME");
    expect(aboutLinks.length).toBeGreaterThan(0);

    // Desktop (0) ABOUT link should have active class
    expect(aboutLinks[0]!.className).toContain("after:w-full");
  });

  it("should show LOG IN when user is not logged in (desktop)", async () => {
    // Arrange
    renderWithNuxt(AppNavbar);

    const accountIcon = document.querySelector(".i-mdi\\:user")!;

    // Act
    await fireEvent.click(accountIcon);

    // Assert: only LOG IN is visible
    expect(screen.getByText("LOG IN")).toBeTruthy();
    expect(screen.queryByText("LOG OUT")).toBeNull();
    expect(screen.queryByText("DASHBOARD")).toBeNull();
  });

  it("should show LOG OUT when user is logged in (desktop)", async () => {
    // Arrange: set logged in user
    const pinia = createTestPinia();
    const authStore = useAuthStore(pinia);
    authStore.loggedIn = true;

    renderWithNuxt(AppNavbar);

    const accountIcon = document.querySelector(".i-mdi\\:user")!;

    // Act
    await fireEvent.click(accountIcon);

    // Assert: only LOG OUT is visible
    expect(screen.getByText("LOG OUT")).toBeTruthy();
    expect(screen.queryByText("LOG IN")).toBeNull();
    expect(screen.queryByText("DASHBOARD")).toBeNull();
  });

  it("should show DASHBOARD for admin user (desktop)", async () => {
    // Arrange: set logged in admin user
    const pinia = createTestPinia();
    const authStore = useAuthStore(pinia);
    authStore.loggedIn = true;
    authStore.user = {
      user_id: "68a9d098b70e48772cd5ceaa",
      email: "admin@gmail.com",
      role: UserSchemaRole.ADMIN,
    }; // Set user with admin role

    renderWithNuxt(AppNavbar);

    const accountIcon = document.querySelector(".i-mdi\\:user")!;

    // Act
    await fireEvent.click(accountIcon);

    // Assert: DASHBOARD and LOG OUT are visible
    expect(screen.getByText("DASHBOARD")).toBeTruthy();
    expect(screen.getByText("LOG OUT")).toBeTruthy();
  });

  it("should call logout and close panels on LOG OUT click", async () => {
    // Arrange: set logged in user
    const pinia = createTestPinia();
    const authStore = useAuthStore(pinia);
    authStore.loggedIn = true;
    authStore.logout = vi.fn();

    // Spy on logout method
    vi.spyOn(authStore, "logout");

    renderWithNuxt(AppNavbar);

    // Act: open account panel and click LOG OUT
    const accountIcon = document.querySelector(".i-mdi\\:user")!;
    await fireEvent.click(accountIcon);

    const logoutBtn = screen.getByText("LOG OUT");
    await fireEvent.click(logoutBtn);

    // Assert: logout called and LOG OUT button no longer visible
    expect(authStore.logout).toHaveBeenCalledOnce();
    expect(screen.queryByText("LOG OUT")).toBeNull();
  });

  it("should show DASHBOARD in mobile menu for admin", async () => {
    // Arrange: set logged in admin user
    const pinia = createTestPinia();
    const authStore = useAuthStore(pinia);
    authStore.loggedIn = true;
    authStore.user = {
      user_id: "68a9d098b70e48772cd5ceaa",
      email: "admin@gmail.com",
      role: UserSchemaRole.ADMIN,
    }; // Set user with admin role

    renderWithNuxt(AppNavbar);

    // Act: open mobile menu
    const openBtn = document.querySelector(".i-mdi\\:menu")!;
    await fireEvent.click(openBtn);

    // Assert: DASHBOARD link is visible
    expect(screen.getByText("DASHBOARD")).toBeTruthy();
  });

  it("should log out and close mobile menu", async () => {
    // Arrange: set logged in user
    const pinia = createTestPinia();
    const authStore = useAuthStore(pinia);
    authStore.loggedIn = true;
    authStore.logout = vi.fn();

    // Spy on logout method
    vi.spyOn(authStore, "logout");

    renderWithNuxt(AppNavbar);

    // Act: open mobile menu and click LOG OUT
    await fireEvent.click(document.querySelector(".i-mdi\\:menu")!);
    await fireEvent.click(screen.getByText("LOG OUT"));

    // Assert: logout called and LOG OUT button no longer visible
    expect(authStore.logout).toHaveBeenCalledOnce();
    expect(screen.queryByText("LOG OUT")).toBeNull();
  });
});
