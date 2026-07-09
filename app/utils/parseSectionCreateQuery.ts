import type { LocationQuery } from "vue-router";
import type { SectionPlacement } from "~~/shared/config/sectionBuilder";

/**
 * Parses placement from /sections/create query string.
 */
export function parseSectionPlacement(query: LocationQuery): SectionPlacement {
  const raw = query.placement;
  const value = Array.isArray(raw) ? raw[0] : raw;

  return value === "standalone" ? "standalone" : "home";
}

/**
 * Parses insertAfter order hint from query string.
 */
export function parseSectionInsertAfter(query: LocationQuery): number | null {
  const raw = query.insertAfter;
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}
