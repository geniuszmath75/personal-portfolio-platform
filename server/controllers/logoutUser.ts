export default defineEventHandler(async (event) => {
  requireAuth(event);

  deleteCookie(event, "auth_token");

  return {
    success: true,
  };
});
