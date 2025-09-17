import getAllProjects from "~~/server/controllers/getAllProjects";

export default defineEventHandler(async (event) => {
  return await getAllProjects(event);
});
