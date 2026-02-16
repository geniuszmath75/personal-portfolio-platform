import getAdminProfile from "~~/server/controllers/admin/getAdminProfile";

export default defineEventHandler(async (event) => {
  return await getAdminProfile(event);
});
