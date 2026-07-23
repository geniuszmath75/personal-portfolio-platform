import { Project } from "~~/server/models/Project";
import {
  getPaginationObject,
  getPaginationParams,
} from "~~/server/utils/pagination";
import { rethrowAsHttpError } from "~~/server/utils/handleDatabaseError";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const { page, limit, skip } = getPaginationParams(query);

    const projects = await Project.find().skip(skip).limit(limit);

    // Create pagination metadata
    const pagination = await getPaginationObject(Project, page, limit);

    // Transform documents to JSON
    const transformedProjects = projects.map((project) => {
      return project.toJSON();
    });

    return {
      projects: transformedProjects,
      count: projects.length,
      pagination,
    };
  } catch (error) {
    rethrowAsHttpError(error);
  }
});
