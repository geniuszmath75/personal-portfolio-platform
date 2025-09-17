import { Project } from "../models/Project";

export default defineEventHandler(async (event) => {
  const projects = await Project.find();

  return { projects: projects, count: projects.length };
});
