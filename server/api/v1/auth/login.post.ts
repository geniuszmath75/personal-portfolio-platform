import loginUser from "~~/server/controllers/loginUser";

export default defineEventHandler(async (event) => {
  return await loginUser(event);
});
