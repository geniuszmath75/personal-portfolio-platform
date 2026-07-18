import { Section } from "~~/server/models/Section";

export default defineEventHandler(async (event) => {
  // Nitro requires the same dynamic param name for sibling routes in one folder
  // (see [id].put.ts). The segment value is the section slug for GET requests.
  const { id: slug } = getRouterParams(event);

  // Validate slug param
  const isValidSlug = typeof slug === "string" && slug.trim().length > 0;

  if (!isValidSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid section slug",
    });
  }

  const section = await Section.findOne({ slug });

  if (!section) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `Section with slug '${slug}' not found.`,
    });
  }

  return { section: section.toJSON() };
});
