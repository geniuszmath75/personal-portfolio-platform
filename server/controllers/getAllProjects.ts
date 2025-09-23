import { Project } from "../models/Project";
import { getPaginationObject, getPaginationParams } from "../utils/pagination";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const { page, limit, skip } = getPaginationParams(query);

  const projects = await Project.find().skip(skip).limit(limit);

  // Create pagination metadata
  const pagination = await getPaginationObject(Project, page, limit);

  return {
    projects,
    count: projects.length,
    pagination,
  };
});
