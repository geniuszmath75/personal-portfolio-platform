import updateAdminProfile from "~~/server/controllers/admin/updateAdminProfile";

export default defineEventHandler(async (event) => {
  return await updateAdminProfile(event);
});
