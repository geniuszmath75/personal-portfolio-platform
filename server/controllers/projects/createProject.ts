import { createProjectSchema } from "../../utils/validateCreateProject";
import { Project } from "../../models/Project";
import { handleDatabaseError } from "../../utils/handleDatabaseError";

export default defineEventHandler(async (event) => {
  try {
    // Ensure that user is ADMIN
    requireAdmin(event);

    // Get request body
    const body = await readBody(event);

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

    // Create new project
    const newProject = await Project.create(validatedBody.data);

    setResponseStatus(event, 201);
    return {
      project: newProject,
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
