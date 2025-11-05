import { Section } from "../models/Section";

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event);

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

  return { section };
});
