import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, ref, toValue } from "vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { usePageSeo } from "~/composables/usePageSeo";
import {
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_OG_IMAGE,
  SEO_ROBOTS_INDEX,
  SEO_ROBOTS_NOINDEX,
} from "~~/shared/seo/siteSeo";

const {
  useSeoMetaMock,
  useHeadMock,
  useRouteMock,
  useRequestURLMock,
  runtimePublic,
} = vi.hoisted(() => ({
  useSeoMetaMock: vi.fn(),
  useHeadMock: vi.fn(),
  useRouteMock: vi.fn(() => ({ path: "/projects" })),
  useRequestURLMock: vi.fn(() => ({ origin: "http://localhost:3000" })),
  runtimePublic: {
    siteUrl: "https://example.com",
  },
}));

mockNuxtImport("useSeoMeta", () => useSeoMetaMock);
mockNuxtImport("useHead", () => useHeadMock);
mockNuxtImport("useRoute", () => useRouteMock);
mockNuxtImport("useRequestURL", () => useRequestURLMock);
mockNuxtImport("useRuntimeConfig", (original) => {
  return () => {
    const config = original();
    return {
      ...config,
      public: {
        ...config.public,
        ...runtimePublic,
      },
    };
  };
});

function resolveMeta(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      typeof value === "function" ? value() : value,
    ]),
  );
}

function lastSeoMeta() {
  return resolveMeta(
    useSeoMetaMock.mock.calls.at(-1)?.[0] as Record<string, unknown>,
  );
}

function lastCanonicalHref() {
  const headInput = useHeadMock.mock.calls.at(-1)?.[0] as {
    link: unknown;
  };
  const links = toValue(headInput.link) as Array<{ rel: string; href: string }>;
  return links.find((link) => link.rel === "canonical")?.href;
}

describe("usePageSeo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runtimePublic.siteUrl = "https://example.com";
    useRouteMock.mockReturnValue({ path: "/projects" });
    useRequestURLMock.mockReturnValue({ origin: "http://localhost:3000" });
  });

  it("should apply default description, og image, robots and absolute URLs", () => {
    usePageSeo({ title: "Projects" });

    expect(lastSeoMeta()).toMatchObject({
      title: "Projects",
      description: SEO_DEFAULT_DESCRIPTION,
      ogTitle: "Projects",
      ogDescription: SEO_DEFAULT_DESCRIPTION,
      ogType: "website",
      ogUrl: "https://example.com/projects",
      ogImage: `https://example.com${SEO_DEFAULT_OG_IMAGE}`,
      robots: SEO_ROBOTS_INDEX,
    });
    expect(lastCanonicalHref()).toBe("https://example.com/projects");
  });

  it("should fall back to the request origin when siteUrl is empty", () => {
    runtimePublic.siteUrl = "";
    useRouteMock.mockReturnValue({ path: "/about" });

    usePageSeo({
      title: "About",
      description: "About page",
      image: "/uploads/cover.jpg",
    });

    expect(lastSeoMeta()).toMatchObject({
      ogUrl: "http://localhost:3000/about",
      ogImage: "http://localhost:3000/uploads/cover.jpg",
      description: "About page",
    });
    expect(lastCanonicalHref()).toBe("http://localhost:3000/about");
  });

  it("should honor explicit overrides and omit blank description/image", () => {
    usePageSeo({
      title: () => "Login",
      description: "   ",
      image: "",
      robots: SEO_ROBOTS_NOINDEX,
      ogType: "article",
    });

    expect(lastSeoMeta()).toMatchObject({
      title: "Login",
      description: undefined,
      ogImage: undefined,
      ogType: "article",
      robots: SEO_ROBOTS_NOINDEX,
    });
  });

  it("should react to ref title and computed description", () => {
    const title = ref("Draft");
    const description = computed(() => `${title.value} details`);

    usePageSeo({
      title,
      description,
      image: "https://cdn.example.com/share.png",
    });

    expect(lastSeoMeta()).toMatchObject({
      title: "Draft",
      description: "Draft details",
      ogImage: "https://cdn.example.com/share.png",
    });

    title.value = "Published";
    expect(lastSeoMeta()).toMatchObject({
      title: "Published",
      description: "Published details",
    });
  });
});
