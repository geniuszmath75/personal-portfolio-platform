import type { H3Event, EventHandlerRequest } from "h3";
import { merge } from "lodash";
import type { NitroAppPlugin } from "nitropack";
import { afterEach, vi } from "vitest";
import { cleanup, render, type RenderOptions } from "@testing-library/vue";
import type { Component } from "vue";
import { createTestingPinia, type TestingOptions } from "@pinia/testing";
import "@testing-library/jest-dom/vitest";

type Handler = (event: H3Event<EventHandlerRequest>) => Promise<unknown>;

export function useH3TestUtils() {
  const h3 = vi.hoisted(() => ({
    defineNitroPlugin: vi.fn((def: NitroAppPlugin) => def),
    defineEventHandler: vi.fn((handler: Handler) => handler),
    readBody: vi.fn(async (event: H3Event) => {
      if (event._requestBody && typeof event._requestBody === "string") {
        return JSON.parse(event._requestBody);
      }
      return event._requestBody || {};
    }),
    getRouterParams: vi.fn((event: H3Event) => event.context?.params || {}),
    getQuery: vi.fn((event: H3Event) => event.context?.query || {}),
  }));

  // Stub the global functions to support auto-imports in tests
  vi.stubGlobal("defineEventHandler", h3.defineEventHandler);
  vi.stubGlobal("defineNitroPlugin", h3.defineNitroPlugin);
  vi.stubGlobal("readBody", h3.readBody);
  vi.stubGlobal("getRouterParams", h3.getRouterParams);
  vi.stubGlobal("getQuery", h3.getQuery);

  return h3;
}

// Global mounting options to the component
const defaultGlobalOptions = {
  stubs: {
    NuxtLink: {
      props: ["to"],
      template: `<a :href="to"><slot /></a>`,
    },
    Icon: {
      props: ["name", "size"],
      template: `<span :data-icon="name"><slot /></span>`,
    },
    Teleport: {
      props: ["to"],
      template: "<slot />",
    },
  },
};

// Helper: create Pinia store for tests
export function createTestPinia(options: TestingOptions = {}) {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    ...options,
  });

  return pinia;
}

// Helper: render component with Nuxt context
export function renderWithNuxt(
  component: Component,
  options: RenderOptions<unknown> = {},
) {
  const mergedGlobalOptions = merge({}, defaultGlobalOptions, options.global);

  return render(component, {
    ...options,
    global: mergedGlobalOptions,
  });
}

// Alias helpers for consistency
export const getByTextSafe = (text: string) =>
  document.body
    .querySelector(`[href], button, div, span, a, p, h1, h2, h3, h4, h5, h6`)
    ?.ownerDocument?.body?.querySelector(`*contains("${text}")`);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
