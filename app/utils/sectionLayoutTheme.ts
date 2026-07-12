/**
 * Returns alternating section background class based on display order.
 * Even orders use the secondary band; odd orders use the primary band.
 */
export function getSectionBackgroundClass(order: number): string {
  return order % 2 === 0 ? "bg-secondary-500" : "bg-primary-500";
}

/**
 * Returns contrasting text color for content placed on the section background.
 */
export function getSectionTextColorClass(order: number): string {
  return order % 2 === 0 ? "text-primary-500" : "text-secondary-500";
}

/**
 * Returns color classes for a HERO section button link.
 *
 * Even `btnIndex` values (0, 2, ...) get the filled primary CTA style.
 * Odd indices get an outline style whose palette matches the section band:
 * even `order` -> primary outline, odd `order` -> additional outline.
 */
export function getSectionBtnLinkColorClasses(
  order: number,
  btnIndex: number,
): string {
  return btnIndex % 2 === 0
    ? "text-primary-500 bg-additional-500 hover:bg-additional-600"
    : order % 2 === 0
      ? "text-primary-500 border-2 bg-transparent border-primary-500 hover:bg-primary-500 hover:text-additional-500"
      : "text-additional-500 border-2 bg-transparent border-additional-500 hover:bg-additional-500 hover:text-primary-500";
}
