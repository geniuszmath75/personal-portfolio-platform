// tests/composables/useRouteParam.spec.ts
import { describe, it, expect, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useRouteParam } from "../../../app/composables/useRouteParam";

const { useRouteMock } = vi.hoisted(() => {
  return {
    useRouteMock: vi.fn(() => ({
      params: {},
    })),
  };
});

mockNuxtImport("useRoute", () => {
  return useRouteMock;
});

describe("useRouteParam", () => {
  it("should return the route param as string when it exists", () => {
    // Arramge & Act: call composable with existing param
    useRouteMock.mockImplementation(() => ({
      params: { id: "123" },
    }));

    const result = useRouteParam("id");

    // Assert: should return correct string value
    expect(result).toBe("123");
  });

  it("should throw error when route param is missing", () => {
    // Arrange: mock useRoute to return empty params
    useRouteMock.mockImplementation(() => ({
      params: {},
    }));

    // Act & Assert: expect an error because param is missing
    expect(() => useRouteParam("id")).toThrowError(
      'Route param "id" is required and must be a string.',
    );
  });

  it("should throw error when route param is not a string", () => {
    // Arrange: mock useRoute to return invalid type (array)
    useRouteMock.mockImplementation(() => ({
      params: { id: ["not", "a", "string"] },
    }));
    // Act & Assert: expect an error due to wrong param type
    expect(() => useRouteParam("id")).toThrowError(
      'Route param "id" is required and must be a string.',
    );
  });
});
