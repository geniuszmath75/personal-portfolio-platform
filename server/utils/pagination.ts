import type { Model } from "mongoose";
import { z } from "zod";
import type { QueryObject } from "ufo";
import type { PaginationProperties, PaginationQuery } from "~~/shared/types";

const paginationSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a positive integer")
    .transform(Number)
    .default(1)
    .refine((val) => val > 0, "Page must be greater than 0"),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a positive integer")
    .transform(Number)
    .default(5)
    .refine((val) => val > 0, "Limit must be greater than 0"),
});

/**
 * Get validated pagination parameters from query string.
 *
 * Ensures `page` and `limit` are positive integers, applies
 * defaults if missing,
 * and calculates `skip` (the number of documents to skip in DB
 * queries).
 *
 * @param query - Query parameters from the request,
 * @returns An `PaginationQuery` object containing validated pagination parameters.
 * @throws {Error} If query parameters are invalid.
 */
export function getPaginationParams(query: QueryObject): PaginationQuery {
  const result = paginationSchema.safeParse(query);

  if (!result.success) {
    const errorData = z.treeifyError(result.error);

    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid pagination parameters",
      data: errorData,
    });
  }

  const { page, limit } = result.data;

  // Calculate skip (offset for database queries)
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
}

/**
 * Build a pagination metadata object for API responses.
 *
 * Uses a Mongoose model to count total documents, calculates total pages,
 * and determines `prevPage` and `nextPage`.
 *
 * @typeParam T - The type of the documents in the collection.
 * @param model - The Mongoose model used to count documents.
 * @param page - Current page number (validated positive integer).
 * @param limit - Number of documents per page (validated positive integer).
 * @returns A `PaginationProperties` object with full pagination details.
 * @throws {Error} If requested page is greater than available total pages.
 */
export async function getPaginationObject<T>(
  model: Model<T>,
  page: number,
  limit: number,
): Promise<PaginationProperties> {
  // Count total documents
  const totalDocuments = await model.countDocuments();

  // Calculate total pages (min. 1)
  const totalPages = Math.max(1, Math.ceil(totalDocuments / limit));

  // Validate page number
  if (page > totalPages) {
    throw createError({
      statusCode: 400,
      message: "Invalid page number",
      statusMessage: "Bad Request",
    });
  }

  return {
    page,
    limit,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: totalPages - 1 >= page ? page + 1 : null,
    totalDocuments,
    totalPages,
  };
}
