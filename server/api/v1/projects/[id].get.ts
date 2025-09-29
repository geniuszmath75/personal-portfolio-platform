import getSingleProject from "~~/server/controllers/getSingleProject";

export default defineEventHandler(async (event) => {
  return await getSingleProject(event);
});
