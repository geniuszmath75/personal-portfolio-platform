export default defineEventHandler(async (event) => {
  requireAdmin(event);

  return { message: `Welcome admin: ${event.context.user?.email}` };
});
