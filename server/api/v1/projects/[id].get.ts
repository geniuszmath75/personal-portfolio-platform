import getSingleProject from "~~/server/controllers/projects/getSingleProject";

export default defineEventHandler(async (event) => {
  return await getSingleProject(event);
});
