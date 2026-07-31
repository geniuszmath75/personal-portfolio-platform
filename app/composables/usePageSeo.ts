import {
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_OG_IMAGE,
  SEO_ROBOTS_INDEX,
} from "~~/shared/seo/siteSeo";
import { toAbsoluteUrl } from "~~/shared/utils/toAbsoluteUrl";
import type { PageSeoOptions } from "~/types/seo";

export type { PageSeoOptions };

/**
 * Applies page-level `useSeoMeta` / `useHead` with absolute og:url and images.
 */
export function usePageSeo(options: PageSeoOptions) {
  const config = useRuntimeConfig();
  const route = useRoute();
  const requestURL = useRequestURL();

  const siteUrl = computed(
    () => String(config.public.siteUrl || "").trim() || undefined,
  );

  const pageTitle = computed(() => toValue(options.title));

  const pageDescription = computed(() => {
    const value = toValue(options.description);
    if (value === undefined) {
      return SEO_DEFAULT_DESCRIPTION || undefined;
    }
    const trimmed = value?.trim();
    return trimmed || undefined;
  });

  const pageImage = computed(() => {
    const value = toValue(options.image);
    if (value === undefined) {
      return SEO_DEFAULT_OG_IMAGE || undefined;
    }
    return value?.trim() || undefined;
  });

  const canonicalUrl = computed(() =>
    toAbsoluteUrl(route.path, siteUrl.value, requestURL.origin),
  );

  const absoluteImage = computed(() =>
    toAbsoluteUrl(pageImage.value, siteUrl.value, requestURL.origin),
  );

  useSeoMeta({
    title: () => pageTitle.value,
    description: () => pageDescription.value,
    ogTitle: () => pageTitle.value,
    ogDescription: () => pageDescription.value,
    ogType: options.ogType ?? "website",
    ogUrl: () => canonicalUrl.value,
    ogImage: () => absoluteImage.value,
    robots: () => toValue(options.robots) ?? SEO_ROBOTS_INDEX,
  });

  useHead({
    link: computed(() =>
      canonicalUrl.value
        ? [{ rel: "canonical", href: canonicalUrl.value }]
        : [],
    ),
  });
}
