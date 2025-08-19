import auth from "~~/server/controllers/auth";

export default defineEventHandler(async (event) => {
  return await auth(event);
});
