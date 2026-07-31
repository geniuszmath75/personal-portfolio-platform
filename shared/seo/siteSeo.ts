/**
 * Site-wide SEO constants used by `app.head` and `usePageSeo`.
 */

/** Site brand used in the document title template. */
export const SEO_SITE_NAME = "Damian Judka";

/** Default document title segment (becomes `%s` in the title template). */
export const SEO_DEFAULT_TITLE = "Portfolio";

/** `%s` is replaced with the page title by Unhead. */
export const SEO_TITLE_TEMPLATE = `%s | ${SEO_SITE_NAME}`;

/** Site-wide meta / default Open Graph description. */
export const SEO_DEFAULT_DESCRIPTION =
  "Full-stack developer portfolio - selected projects, skills, and experience by Damian Judka.";

/** Default Open Graph / Twitter image (under `public/`). */
export const SEO_DEFAULT_OG_IMAGE = "/logo/og-default.png";

/** Meta description for the public projects list. */
export const SEO_PROJECTS_DESCRIPTION =
  "Browse selected software projects by Damian Judka, including stack, timeline, and outcomes.";

/** Robots value for public, indexable pages. */
export const SEO_ROBOTS_INDEX = "index, follow";

/** Robots value for auth, admin, and other private surfaces. */
export const SEO_ROBOTS_NOINDEX = "noindex, nofollow";
