import { User } from "~~/server/models/User";
import { updateUserProfileSchema } from "~~/shared/utils/validateUpdateUserProfile";

export default defineEventHandler(async (event) => {
  try {
    // Ensure that user is ADMIN
    requireAdmin(event);

    // Get logged in ADMIN id
    const adminId = event.context.user?.user_id;

    // Get request body
    const body = await readBody(event);

    // Validate types of body fields
    const validatedBody = updateUserProfileSchema.safeParse(body);

    // Check if types are correct
    if (!validatedBody.success) {
      const errorMessages = validatedBody.error.issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");

      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: errorMessages,
      });
    }

    const { email, username } = validatedBody.data;

    // Check if at least one field is provided
    if (!username && !email) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "At least one field (username, email) must be provided",
      });
    }

    // Build update object with only provided fields
    const updateData: { username?: string; email?: string } = {};
    if (isDefinedAndNotNull(username)) updateData.username = username.trim();
    if (isDefinedAndNotNull(email))
      updateData.email = email.toLowerCase().trim();

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(adminId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "User not found",
      });
    }

    // Prepare updated admin profile details response
    const adminUser = {
      email: updatedUser?.email,
      username: updatedUser?.username,
      avatar: updatedUser?.avatar,
      role: updatedUser?.role,
      createdAt: updatedUser?.createdAt,
      updatedAt: updatedUser?.updatedAt,
    };

    return {
      admin: adminUser,
    };
  } catch (error) {
    if (error instanceof H3Error) {
      throw error;
    }

    const customError = handleDatabaseError(error);

    throw createError({
      statusCode: customError.code,
      statusMessage: customError.statusMessage,
      message: customError.message,
    });
  }
});
