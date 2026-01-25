import getMeUser from "~~/server/controllers/getMeUser";

export default defineEventHandler(async (event) => {
  return await getMeUser(event);
});
