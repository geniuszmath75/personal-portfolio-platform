import { User } from "~~/server/models/User";
import { UserSchemaRole } from "~~/shared/types/enums";
import { requireAdmin } from "~~/server/utils/auth";
import { rethrowAsHttpError } from "~~/server/utils/handleDatabaseError";

export default defineEventHandler(async (event) => {
  try {
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
  } catch (error) {
    rethrowAsHttpError(error);
  }
});
