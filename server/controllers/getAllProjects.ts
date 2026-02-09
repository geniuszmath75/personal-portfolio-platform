import { Project } from "../models/Project";
import { getPaginationObject, getPaginationParams } from "../utils/pagination";

export default defineEventHandler(async (event) => {
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
});
