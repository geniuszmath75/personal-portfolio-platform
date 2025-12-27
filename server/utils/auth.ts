import type { H3Event } from "h3";
import jwt from "jsonwebtoken";
import { jwtPayloadSchema } from "../../server/utils/validateJwtPayload";
/**
 * Check if the user is logged in
 *
 * @param event - H3Event instance
 * @throws 401 Unauthorized error
 */
export function requireAuth(event: H3Event): void {
  const { jwtSecret } = useRuntimeConfig(event);

  // Attempting to read a token from http-only cookie
  const token = getCookie(event, "auth_token");

  // Check if token exists
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Authentication invalid",
    });
  }

  try {
    // Verify token and validate its schema
    const verifiedPayload = jwt.verify(token, jwtSecret);
    const validatedPayload = jwtPayloadSchema.parse(verifiedPayload);

    // Set payload to event context, update authentication flag
    event.context.user = {
      user_id: validatedPayload.userId,
      email: validatedPayload.email,
      role: validatedPayload.role,
    };
    event.context.isAuthenticated = true;
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Authentication invalid",
    });
  }
}

/**
 * Check if the user has ADMIN role
 *
 * @param event - H3Event instance
 * @returns information about authenticated ADMIN user
 * @throws 403 Forbidden error
 */
export function requireAdmin(event: H3Event): void {
  requireAuth(event);

  if (event.context.user?.role !== "ADMIN") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "Admin access required",
    });
  }
}
