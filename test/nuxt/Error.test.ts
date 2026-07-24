import { describe, expect, it, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { fireEvent } from "@testing-library/vue";
import { renderWithNuxt } from "~~/test/setup";
import ErrorPage from "~/error.vue";

const { clearErrorMock, headDisposeMock } = vi.hoisted(() => ({
  clearErrorMock: vi.fn(),
  headDisposeMock: vi.fn(),
}));

mockNuxtImport("clearError", () => clearErrorMock);
mockNuxtImport("useHead", () => () => ({ dispose: headDisposeMock }));

describe("error.vue", () => {
  it("should render 404 copy and home CTA", () => {
    const { getByRole, getAllByText } = renderWithNuxt(ErrorPage, {
      props: {
        error: {
          status: 404,
          statusMessage: "Not Found",
          message: "Page not found",
        },
      },
    });

    expect(getByRole("heading", { name: "Page not found" })).toBeTruthy();
    expect(getAllByText("404").length).toBeGreaterThanOrEqual(1);
    expect(getByRole("button", { name: "Go home" })).toBeTruthy();
  });

  it("should dispose error title then clear error on Go home", async () => {
    clearErrorMock.mockClear();
    headDisposeMock.mockClear();

    const { getByRole } = renderWithNuxt(ErrorPage, {
      props: {
        error: {
          status: 500,
          statusMessage: "Internal Server Error",
          message: "boom",
        },
      },
    });

    await fireEvent.click(getByRole("button", { name: "Go home" }));

    expect(headDisposeMock).toHaveBeenCalled();
    expect(clearErrorMock).toHaveBeenCalledWith({ redirect: "/" });
    expect(headDisposeMock.mock.invocationCallOrder[0]).toBeLessThan(
      clearErrorMock.mock.invocationCallOrder[0]!,
    );
  });
});
