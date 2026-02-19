import { uploadCategorySchema } from "~~/server/utils/validateUploadImage";
import { uploadImage } from "./uploadImage";
import { UploadCategory } from "~~/shared/types/enums";

export default defineEventHandler(async (event) => {
  requireAuth(event);

  // Get category from query params
  const query = getQuery(event);
  const category = query.category || UploadCategory.AVATARS;

  // Validate category
  const validatedCategory = uploadCategorySchema.safeParse(category);

  // Array of valid categories
  const validCategories: UploadCategory[] = Object.values(UploadCategory);

  // Check if category parameter is valid
  if (!validatedCategory.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Invalid category parameter. Allowed: ${validCategories.join(", ")}`,
    });
  }

  // Upload image
  const result = await uploadImage(event, validatedCategory.data);

  return {
    success: true,
    data: result,
  };
});
