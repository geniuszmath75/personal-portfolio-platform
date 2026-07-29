/**
 * Resolves a section image source path for display.
 *
 * Paths already usable as an `<img src>` — site-relative (`/uploads/...`,
 * `/images/...`), remote CDN (`https://...`), and local `blob:` previews —
 * are returned unchanged. Legacy seed filenames are resolved against `/images/`.
 */
export function resolveSectionImageSrc(srcPath: string): string {
  if (
    srcPath.startsWith("/") ||
    srcPath.startsWith("blob:") ||
    srcPath.startsWith("http://") ||
    srcPath.startsWith("https://")
  ) {
    return srcPath;
  }

  return `/images/${srcPath}`;
}
