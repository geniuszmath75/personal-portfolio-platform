/**
 * Hostname(s) from an upload public base URL for Nuxt Image `domains`.
 * Accepts a bare host (`cdn.example.com`) or a full URL.
 */
export function uploadCdnDomains(
  baseUrl: string | undefined = process.env.UPLOAD_PUBLIC_BASE_URL,
): string[] {
  const base = baseUrl?.trim();
  if (!base) {
    return [];
  }

  try {
    const url = base.includes("://")
      ? new URL(base)
      : new URL(`https://${base}`);
    return url.hostname ? [url.hostname] : [];
  } catch {
    const host = base.replace(/^\/+|\/+$/g, "").split("/")[0];
    return host ? [host] : [];
  }
}
