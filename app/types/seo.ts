import type { MaybeRefOrGetter } from "vue";

/**
 * Options for configuring page-level SEO meta tags and head elements.
 * Lives under `app/` (not `shared/`) because it uses Vue's `MaybeRefOrGetter`.
 */
export type PageSeoOptions = {
  /** Page title segment (Unhead applies the global titleTemplate). */
  title: MaybeRefOrGetter<string>;
  /** Meta / OG description. Empty or null omits the tags. */
  description?: MaybeRefOrGetter<string | undefined | null>;
  /** Relative path or absolute image URL for og:image / twitter:image. */
  image?: MaybeRefOrGetter<string | undefined | null>;
  /** robots meta; defaults to index,follow for public pages. */
  robots?: MaybeRefOrGetter<string | undefined>;
  /** Open Graph type. */
  ogType?: "website" | "article";
};
