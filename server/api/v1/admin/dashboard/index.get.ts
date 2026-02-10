import getAdminDetails from "~~/server/controllers/getAdminDetails";

export default defineEventHandler(async (event) => {
  return await getAdminDetails(event);
});
