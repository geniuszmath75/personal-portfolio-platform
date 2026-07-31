/**
 * Builds an absolute URL from an optional public site origin and a path/URL.
 * Falls back to `fallbackOrigin` (e.g. request URL origin) when site URL is
 * unset.
 */
export function toAbsoluteUrl(
  pathOrUrl: string | undefined | null,
  siteUrl: string | undefined | null,
  fallbackOrigin?: string,
): string | undefined {
  if (!pathOrUrl) {
    return undefined;
  }

  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const origin = (
    siteUrl?.replace(/\/$/, "") ||
    fallbackOrigin?.replace(/\/$/, "") ||
    ""
  ).trim();
  if (!origin) {
    return pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  }

  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${origin}${path}`;
}
