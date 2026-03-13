import { describe, it, expect, beforeEach, vi } from "vitest";
import { useH3TestUtils } from "../../../../setup";
import { createMockH3Event } from "../../../../mock/h3-event";
import { uploadImage } from "../../../../../server/controllers/upload/uploadImage";
import { UploadCategory } from "../../../../../shared/types/enums";
import { vol } from "memfs";

vi.mock("fs/promises", async () => {
  const { fs } = await import("memfs");
  return {
    default: fs.promises,
  };
});

vi.mock("node:crypto", () => {
  return {
    default: {
      randomUUID: vi.fn(() => "mocked-UUID"),
    },
  };
});

useH3TestUtils();

const createMockFileData = (overrides = {}) => ({
  name: "image",
  filename: "test-image.jpg",
  type: "image/jpeg",
  data: Buffer.alloc(1024),
  ...overrides,
});

describe("uploadImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vol.reset();
  });

  describe("successful upload", () => {
    it("should return upload response with correct URL for default AVATARS category", async () => {
      // Arrange: prepare event and mock valid file data
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData(),
      ]);

      // Act: call uploadImage with default category
      const result = await uploadImage(event);

      // Assert: result contains correct URL with avatars category
      expect(result.url).toBe("/uploads/avatars/mocked-UUID.jpg");
    });

    it("should return upload response with correct URL for custom category", async () => {
      // Arrange: prepare event and mock valid file data
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData(),
      ]);

      // Act: call uploadImage with custom category
      const result = await uploadImage(event, UploadCategory.AVATARS);

      // Assert: result URL contains the given category
      expect(result.url).toContain(`/uploads/${UploadCategory.AVATARS}/`);
    });

    it("should return correct filename, size and mimetype in upload response", async () => {
      // Arrange: prepare event and mock file with known size and type
      const fileData = createMockFileData({
        filename: "mocked-UUID.png",
        data: Buffer.alloc(2048),
        type: "image/png",
      });

      const event = createMockH3Event({
        multiPartFormData: [fileData],
      });
      vi.mocked(readMultipartFormData).mockResolvedValue([fileData]);

      // Act: call uploadImage
      const result = await uploadImage(event);

      // Assert: result metadata matches file data
      expect(result.filename).toBe("mocked-UUID.png");
      expect(result.size).toBe(2048);
      expect(result.mimetype).toBe("image/png");
    });

    it("should use extension from MIME type when file has no extension", async () => {
      // Arrange: prepare file without extension in filename
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData({ filename: "upload", type: "image/webp" }),
      ]);

      // Act: call uploadImage
      const result = await uploadImage(event);

      // Assert: extension is derived from MIME type
      expect(result.filename).toBe("mocked-UUID.webp");
    });

    it("should call mkdir and writeFile when uploading valid file", async () => {
      // Arrange: prepare event and valid file data
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData(),
      ]);

      // Act: call uploadImage
      await uploadImage(event);

      // Assert: file was written to virtual filesystem
      const files = vol.toJSON();
      expect(Object.keys(files).length).toBe(1);
      expect(Object.keys(files)[0]).toContain("mocked-UUID.jpg");
    });

    it("should sanitize filename with special characters", async () => {
      // Arrange: prepare file with special characters in filename
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData({ filename: "my file@name!.jpg" }),
      ]);

      // Act: call uploadImage
      const result = await uploadImage(event);

      // Assert: filename contains uuid without special characters
      expect(result.filename).toBe("mocked-UUID.jpg");
    });
  });

  describe("form data validation", () => {
    it("should throw 400 when form data is empty", async () => {
      // Arrange: prepare event with no form data
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([]);

      // Act: call uploadImage
      const result = uploadImage(event);

      // Assert: error with 400 status is thrown
      await expect(result).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "No file uploaded",
      });
    });

    it("should throw 400 when form data is undefined", async () => {
      // Arrange: prepare event with null form data
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue(undefined);

      // Act: call uploadImage
      const result = uploadImage(event);

      // Assert: error with 400 status is thrown
      await expect(result).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "No file uploaded",
      });
    });

    it("should throw 400 when image field is missing from form data", async () => {
      // Arrange: prepare form data without image field
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData({ name: "other-field" }),
      ]);

      // Act: call uploadImage
      const result = uploadImage(event);

      // Assert: error with 400 status is thrown
      await expect(result).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "No file found in form data",
      });
    });

    it("should throw 400 when file data buffer is missing", async () => {
      // Arrange: prepare form data with image field but no data buffer
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData({ data: undefined }),
      ]);

      // Act: call uploadImage
      const result = uploadImage(event);

      // Assert: error with 400 status is thrown
      await expect(result).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "No file found in form data",
      });
    });
  });

  describe("MIME type validation", () => {
    it("should throw 400 for disallowed MIME type", async () => {
      // Arrange: prepare file with invalid MIME type
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData({ type: "application/pdf" }),
      ]);

      // Act: call uploadImage
      const result = uploadImage(event);

      // Assert: error with 400 status is thrown
      await expect(result).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: expect.stringContaining("Invalid file type"),
      });
    });

    it("should throw 400 when MIME type is empty", async () => {
      // Arrange: prepare file without MIME type
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData({ type: "" }),
      ]);

      // Act: call uploadImage
      const result = uploadImage(event);

      // Assert: error with 400 status is thrown
      await expect(result).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: expect.stringContaining("Invalid file type"),
      });
    });

    it.each(["image/jpeg", "image/png", "image/webp", "image/svg+xml"])(
      "should accept %s as valid MIME type",
      async (mimeType) => {
        // Arrange: prepare file with each allowed MIME type
        const event = createMockH3Event({});
        vi.mocked(readMultipartFormData).mockResolvedValue([
          createMockFileData({ type: mimeType }),
        ]);

        // Act: call uploadImage
        const result = await uploadImage(event);

        // Assert: upload succeeds
        expect(result.mimetype).toBe(mimeType);
      },
    );

    it("should use 'upload' as default filename when filename is undefined", async () => {
      // Arrange: prepare file without filename
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData({ filename: undefined }),
      ]);

      // Act: call uploadImage
      const result = await uploadImage(event);

      // Assert: filename is generated from uuid with extension from MIME type
      expect(result.filename).toBe("mocked-UUID.jpg");
    });
  });

  describe("file size validation", () => {
    it("should throw 400 when file exceeds 5MB limit", async () => {
      // Arrange: prepare file exceeding max size (5MB + 1 byte)
      const event = createMockH3Event({});
      const oversizedBuffer = Buffer.alloc(1024 * 1024 * 5 + 1);
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData({ data: oversizedBuffer }),
      ]);

      // Act: call uploadImage
      const result = uploadImage(event);

      // Assert: error with 400 status is thrown
      await expect(result).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: expect.stringContaining("File too large"),
      });
    });

    it("should accept file exactly at 5MB limit", async () => {
      // Arrange: prepare file exactly at max size (5MB)
      const event = createMockH3Event({});
      const maxSizeBuffer = Buffer.alloc(1024 * 1024 * 5);
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData({ data: maxSizeBuffer }),
      ]);

      // Act: call uploadImage
      const result = await uploadImage(event);

      // Assert: upload succeeds
      expect(result.size).toBe(1024 * 1024 * 5);
    });
  });

  describe("error handling", () => {
    it("should throw 500 when unexpected error occurs", async () => {
      // Arrange: prepare event and make readMultipartFormData throw unknown error
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockRejectedValue(
        new Error("Unexpected error"),
      );

      // Act: call uploadImage
      const result = uploadImage(event);

      // Assert: error is wrapped in 500 status
      await expect(result).rejects.toMatchObject({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: "Failed to upload image",
      });
    });

    it("should rethrow H3Error without wrapping", async () => {
      // Arrange: prepare event and make readMultipartFormData throw H3Error
      const event = createMockH3Event({});
      const h3Error = createError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "Access denied",
      });
      vi.mocked(readMultipartFormData).mockRejectedValue(h3Error);

      // Act: call uploadImage
      const result = uploadImage(event);

      // Assert: original H3Error is rethrown as-is
      await expect(result).rejects.toMatchObject({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "Access denied",
      });
    });
  });
});
