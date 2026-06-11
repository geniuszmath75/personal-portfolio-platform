import { Types } from "mongoose";
import { Project } from "~~/server/models/Project";
import { createProjectSchema } from "~~/server/utils/validateCreateProject";
import { requireAdmin } from "~~/server/utils/auth";
import { H3Error } from "h3";
import { handleDatabaseError } from "~~/server/utils/handleDatabaseError";

export default defineEventHandler(async (event) => {
  try {
    // Ensure that user is ADMIN
    requireAdmin(event);

    // Get project id and request body
    const { id } = getRouterParams(event);
    const body = await readBody(event);

    // Validate id param
    const isValidId = Types.ObjectId.isValid(String(id));

    if (!isValidId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Invalid project id",
      });
    }

    // Validate request body against schema
    const validatedBody = createProjectSchema.safeParse(body);

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

    // Update project
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      validatedBody.data,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!updatedProject) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Project not found",
      });
    }

    return {
      project: updatedProject,
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
