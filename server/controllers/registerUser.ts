/**
 * Public registration is disabled.
 */
export default defineEventHandler(() => {
  throw createError({
    statusCode: 403,
    statusMessage: "Forbidden",
    message: "Registration is disabled",
  });
});
