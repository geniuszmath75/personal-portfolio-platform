import { H3Error } from "h3";
import { Types } from "mongoose";
import { Section } from "~~/server/models/Section";
import { requireAdmin } from "~~/server/utils/auth";
import { handleDatabaseError } from "~~/server/utils/handleDatabaseError";
import { createSectionSchema } from "~~/server/utils/validateCreateSection";

export default defineEventHandler(async (event) => {
  try {
    // Ensure that user is ADMIN
    requireAdmin(event);

    // Get section id and request body
    const { id } = getRouterParams(event);
    const body = await readBody(event);

    // Validate id param
    const isValidId = Types.ObjectId.isValid(String(id));

    if (!isValidId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Invalid section id",
      });
    }

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

    // Load existing section before mutating order of siblings
    const existingSection = await Section.findById(id);

    if (!existingSection) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Section not found",
      });
    }

    const oldOrder = existingSection.order;
    const newOrder = validatedBody.data.order;

    // Shift sibling sections only when order actually changes
    if (newOrder !== oldOrder) {
      if (newOrder > oldOrder) {
        // Moving later: close the gap behind, open a slot at newOrder
        await Section.updateMany(
          {
            _id: { $ne: id },
            order: { $gt: oldOrder, $lte: newOrder },
          },
          { $inc: { order: -1 } },
        );
      } else {
        // Moving earlier: push siblings down to free newOrder
        await Section.updateMany(
          {
            _id: { $ne: id },
            order: { $gte: newOrder, $lt: oldOrder },
          },
          { $inc: { order: 1 } },
        );
      }
    }

    // Update section
    const updatedSection = await Section.findByIdAndUpdate(
      id,
      validatedBody.data,
      {
        returnDocument: "after",
        runValidators: true,
        context: "query",
      },
    );

    if (!updatedSection) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Section not found",
      });
    }

    return {
      section: updatedSection,
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
