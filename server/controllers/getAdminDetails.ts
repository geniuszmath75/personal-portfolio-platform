import { User } from "../models/User";
import { UserSchemaRole } from "../types/enums";

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  // Get admin details
  const adminDetails = await User.findOne({ role: UserSchemaRole.ADMIN });

  if (!adminDetails) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "User with ADMIN role not found",
    });
  }

  // Prepare admin details response
  const adminUser = {
    email: adminDetails.email,
    username: adminDetails.username,
    avatar: adminDetails.avatar,
    role: adminDetails.role,
    createdAt: adminDetails.createdAt,
    updatedAt: adminDetails.updatedAt,
  };

  return {
    admin: adminUser,
  };
});
