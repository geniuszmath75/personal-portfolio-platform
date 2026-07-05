import { H3Error } from "h3";
import { Section } from "~~/server/models/Section";
import { requireAdmin } from "~~/server/utils/auth";
import { handleDatabaseError } from "~~/server/utils/handleDatabaseError";
import { createSectionSchema } from "~~/server/utils/validateCreateSection";

export default defineEventHandler(async (event) => {
  try {
    // Ensure that user is ADMIN
    requireAdmin(event);

    // Get request body
    const body = await readBody(event);

    // Validate request body against schema
    const validatedBody = createSectionSchema.safeParse(body);

    // Check if types are correct
    if (!validatedBody.success) {
      const errorMessages = validatedBody.error.issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");

      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: errorMessages,
      });
    }

    // Create new section
    const newSection = await Section.create(validatedBody.data);

    setResponseStatus(event, 201);
    return {
      section: newSection,
    };
  } catch (error) {
    if (error instanceof H3Error) {
      throw error;
    }

    const customError = handleDatabaseError(error);

    throw createError({
      statusCode: customError.code,
      statusMessage: customError.statusMessage,
      message: customError.message,
    });
  }
});
