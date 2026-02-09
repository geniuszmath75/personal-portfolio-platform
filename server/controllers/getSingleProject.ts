import { Project } from "../models/Project";
import { Types } from "mongoose";

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event);

  // Validate id param
  const isValidId = Types.ObjectId.isValid(String(id));

  if (!isValidId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid project id",
    });
  }

  const project = await Project.findById(id);

  if (!project) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `Project with id ${id} not found.`,
    });
  }

  return { project: project.toJSON() };
});
