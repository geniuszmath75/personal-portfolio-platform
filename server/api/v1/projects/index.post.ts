import createProject from "~~/server/controllers/projects/createProject";

export default defineEventHandler(async (event) => {
  return await createProject(event);
});
