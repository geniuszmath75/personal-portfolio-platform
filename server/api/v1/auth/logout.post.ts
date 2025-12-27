import logoutUser from "~~/server/controllers/logoutUser";

export default defineEventHandler(async (event) => {
  return await logoutUser(event);
});
