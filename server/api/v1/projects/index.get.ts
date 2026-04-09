import getAllProjects from "~~/server/controllers/projects/getAllProjects";

export default defineEventHandler(async (event) => {
  return await getAllProjects(event);
});
