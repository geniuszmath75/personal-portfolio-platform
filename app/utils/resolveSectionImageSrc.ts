/**
 * Resolves a section image source path for display.
 *
 * Paths already usable as an `<img src>` - absolute URLs (`/uploads/...`,
 * `/images/...`) and local `blob:` previews - are returned unchanged.
 * Legacy seed filenames are resolved against `/images/`.
 */
export function resolveSectionImageSrc(srcPath: string): string {
  if (srcPath.startsWith("/") || srcPath.startsWith("blob:")) {
    return srcPath;
  }

  return `/images/${srcPath}`;
}
