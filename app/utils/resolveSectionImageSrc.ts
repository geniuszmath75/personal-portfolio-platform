/**
 * Resolves a section image source path for display.
 * Uploaded images use absolute paths (/uploads/sections/...).
 * Legacy seed images use bare filenames resolved against /images/.
 */
export function resolveSectionImageSrc(srcPath: string): string {
  if (srcPath.startsWith("/")) {
    return srcPath;
  }

  return `/images/${srcPath}`;
}
