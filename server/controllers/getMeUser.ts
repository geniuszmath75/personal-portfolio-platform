import type { AuthUser } from "~~/shared/types";

export default defineEventHandler(async (event) => {
  requireAuth(event);

  // Retrieve the authenticated user from the event context
  const user = event.context.user;

  // If no user is found, throw an unauthorized error
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Authentication invalid",
    });
  }

  // Construct the AuthUser object to return
  const authUser: AuthUser = {
    user_id: user.user_id,
    email: user.email,
    role: user.role,
  };

  return {
    user: authUser,
  };
});
