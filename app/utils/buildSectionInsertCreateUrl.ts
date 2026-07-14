/**
 * Builds the section create URL for home placement with optional insertAfter.
 */
export function buildSectionInsertCreateUrl(
  insertAfter?: number | null,
): string {
  const params = new URLSearchParams({ placement: "home" });

  if (insertAfter !== null && insertAfter !== undefined) {
    params.set("insertAfter", String(insertAfter));
  }

  return `/sections/create?${params.toString()}`;
}

/**
 * Accessible label for a section insert trigger.
 */
export function getSectionInsertAriaLabel(insertAfter?: number | null): string {
  if (insertAfter !== null && insertAfter !== undefined) {
    return `Insert section after order ${insertAfter}`;
  }

  return "Insert section on home page";
}
