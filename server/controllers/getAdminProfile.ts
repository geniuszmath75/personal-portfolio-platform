import { User } from "../models/User";
import { UserSchemaRole } from "../../shared/types/enums";

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  // Get admin profile details
  const adminProfile = await User.findOne({ role: UserSchemaRole.ADMIN });

  if (!adminProfile) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "User with ADMIN role not found",
    });
  }

  // Prepare admin profile details response
  const adminUser = {
    email: adminProfile.email,
    username: adminProfile.username,
    avatar: adminProfile.avatar,
    role: adminProfile.role,
    createdAt: adminProfile.createdAt,
    updatedAt: adminProfile.updatedAt,
  };

  return {
    admin: adminUser,
  };
});
