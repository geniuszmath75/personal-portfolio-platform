import getAdminProfile from "~~/server/controllers/getAdminProfile";

export default defineEventHandler(async (event) => {
  return await getAdminProfile(event);
});
