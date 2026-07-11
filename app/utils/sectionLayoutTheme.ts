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
