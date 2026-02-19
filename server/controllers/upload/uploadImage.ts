import type { H3Event } from "h3";
import type { UploadImageResponse } from "~~/shared/types";
import { extname, join } from "path";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { UploadCategory } from "~~/shared/types/enums";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

/**
 * Maximum file size in bytes (5MB)
 */
const MAX_FILE_SIZE = 1024 * 1024 * 5;

/**
 * Sanitize filename to prevent directory traversal
 * @param fileName - uploaded file name
 * @returns file name without dangerous characters converted to lower case
 */
function sanitizeFilenam(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/\.+/g, ".")
    .toLowerCase();
}

/**
 * Get file extension from MIME type
 * @param mimetype - MIME type
 * @returns file extension based on given MIME type (default .jpg)
 */
function getExtensionFromMime(mimetype: string): string {
  const mimeMap: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
  };

  return mimeMap[mimetype] || ".jpg";
}

/**
 * Upload and save image file to the server
 *
 * @param event - H3 event object
 * @param category - upload category for organizing
 * files
 * @returns upload response with file URL and metadata
 */
export async function uploadImage(
  event: H3Event,
  category: UploadCategory = UploadCategory.AVATARS,
): Promise<UploadImageResponse> {
  try {
    // Parse multipart form data
    const form = await readMultipartFormData(event);

    if (!form || form.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "No file uploaded",
      });
    }

    // Get the first file from form data
    const fileData = form.find((item) => item.name === "image");

    if (!fileData || !fileData.data) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "No file found in form data",
      });
    }

    // Validate MIME type
    const mimeType = fileData.type || "";
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
      });
    }

    // Validate file size
    const fileSize = fileData.data.length;
    if (fileSize > MAX_FILE_SIZE) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
    }

    // Generate unique filename
    const originalFilename = fileData.filename || "upload";
    const sanitizedFilename = sanitizeFilenam(originalFilename);
    const extension =
      extname(sanitizedFilename) || getExtensionFromMime(mimeType);
    const uniqueFilename = `${randomUUID()}${extension}`;

    // Determine upload path
    const uploadDir = join(process.cwd(), "public", "uploads", category);
    const filePath = join(uploadDir, uniqueFilename);

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Write file to disk
    await writeFile(filePath, fileData.data);

    // Generate public URL
    const publicUrl = `/uploads/${category}/${uniqueFilename}`;

    return {
      url: publicUrl,
      filename: uniqueFilename,
      size: fileSize,
      mimetype: mimeType,
    };
  } catch (error) {
    if (error instanceof H3Error) {
      throw error;
    }

    // Wrap unknown errors
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Failed to upload image",
    });
  }
}
