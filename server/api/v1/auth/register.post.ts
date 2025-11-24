import registerUser from "~~/server/controllers/registerUser";

export default defineEventHandler(async (event) => {
  return await registerUser(event);
});
