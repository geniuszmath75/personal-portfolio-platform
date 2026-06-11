import updateProject from "~~/server/controllers/projects/updateProject";

export default defineEventHandler(async (event) => {
  return await updateProject(event);
});
