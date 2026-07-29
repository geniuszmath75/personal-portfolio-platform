import { describe, expect, it, vi, beforeEach } from "vitest";
import { useH3TestUtils } from "~~/test/setup";
import { createMockH3Event } from "~~/test/mock/h3-event";
import { uploadImage } from "~~/server/controllers/upload/uploadImage";
import { UploadCategory } from "~~/shared/types/enums";

useH3TestUtils();

const { putObjectMock } = vi.hoisted(() => ({
  putObjectMock: vi.fn(),
}));

vi.mock("~~/server/utils/storage", () => ({
  getStorageProvider: () => ({
    putObject: putObjectMock,
  }),
}));

const { randomUUIDMock } = vi.hoisted(() => ({
  randomUUIDMock: vi.fn(() => "mocked-UUID"),
}));

vi.mock("crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("crypto")>();
  return {
    default: {
      ...actual,
      randomUUID: randomUUIDMock,
    },
  };
});

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
    randomUUIDMock.mockReturnValue("mocked-UUID");
    putObjectMock.mockResolvedValue({
      publicUrl: "/uploads/avatars/mocked-UUID.jpg",
    });
  });

  describe("successful upload", () => {
    it("should return upload response with correct URL for default AVATARS category", async () => {
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData(),
      ]);

      const result = await uploadImage(event);

      expect(result.url).toBe("/uploads/avatars/mocked-UUID.jpg");
    });

    it("should return upload response with correct URL for custom category", async () => {
      putObjectMock.mockResolvedValueOnce({
        publicUrl: "/uploads/projects/mocked-UUID.jpg",
      });

      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData(),
      ]);

      const result = await uploadImage(event, UploadCategory.PROJECTS);

      expect(result.url).toContain(`/uploads/${UploadCategory.PROJECTS}/`);
    });

    it("should return correct filename, size and mimetype in upload response", async () => {
      const fileData = createMockFileData({
        filename: "mocked-UUID.png",
        data: Buffer.alloc(2048),
        type: "image/png",
      });

      const event = createMockH3Event({
        multiPartFormData: [fileData],
      });
      vi.mocked(readMultipartFormData).mockResolvedValue([fileData]);

      const result = await uploadImage(event);

      expect(result.filename).toBe("mocked-UUID.png");
      expect(result.size).toBe(2048);
      expect(result.mimetype).toBe("image/png");
    });

    it("should use extension from MIME type when file has no extension", async () => {
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData({ filename: "upload", type: "image/webp" }),
      ]);

      const result = await uploadImage(event);

      expect(result.filename).toBe("mocked-UUID.webp");
    });

    it("should call storage putObject with generated key and file metadata", async () => {
      const fileData = createMockFileData();
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([fileData]);

      await uploadImage(event);

      expect(putObjectMock).toHaveBeenCalledWith({
        key: "avatars/mocked-UUID.jpg",
        body: fileData.data,
        contentType: "image/jpeg",
      });
    });

    it("should sanitize filename with special characters", async () => {
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData({ filename: "my file@name!.jpg" }),
      ]);

      const result = await uploadImage(event);

      expect(result.filename).toBe("mocked-UUID.jpg");
    });
  });

  describe("form data validation", () => {
    it("should throw 400 when form data is empty", async () => {
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([]);

      await expect(uploadImage(event)).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "No file uploaded",
      });
      expect(putObjectMock).not.toHaveBeenCalled();
    });

    it("should throw 400 when form data is undefined", async () => {
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue(undefined);

      await expect(uploadImage(event)).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "No file uploaded",
      });
    });

    it("should throw 400 when image field is missing from form data", async () => {
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData({ name: "other-field" }),
      ]);

      await expect(uploadImage(event)).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "No file found in form data",
      });
    });

    it("should throw 400 when file data buffer is missing", async () => {
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData({ data: undefined }),
      ]);

      await expect(uploadImage(event)).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "No file found in form data",
      });
    });
  });

  describe("MIME type validation", () => {
    it("should throw 400 for disallowed MIME type", async () => {
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData({ type: "application/pdf" }),
      ]);

      await expect(uploadImage(event)).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: expect.stringContaining("Invalid file type"),
      });
    });

    it("should throw 400 when MIME type is empty", async () => {
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData({ type: "" }),
      ]);

      await expect(uploadImage(event)).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: expect.stringContaining("Invalid file type"),
      });
    });

    it.each(["image/jpeg", "image/png", "image/webp", "image/svg+xml"])(
      "should accept %s as valid MIME type",
      async (mimeType) => {
        const event = createMockH3Event({});
        vi.mocked(readMultipartFormData).mockResolvedValue([
          createMockFileData({ type: mimeType }),
        ]);

        const result = await uploadImage(event);

        expect(result.mimetype).toBe(mimeType);
      },
    );

    it("should use 'upload' as default filename when filename is undefined", async () => {
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData({ filename: undefined }),
      ]);

      const result = await uploadImage(event);

      expect(result.filename).toBe("mocked-UUID.jpg");
    });
  });

  describe("file size validation", () => {
    it("should throw 400 when file exceeds 5MB limit", async () => {
      const event = createMockH3Event({});
      const oversizedBuffer = Buffer.alloc(1024 * 1024 * 5 + 1);
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData({ data: oversizedBuffer }),
      ]);

      await expect(uploadImage(event)).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: expect.stringContaining("File too large"),
      });
    });

    it("should accept file exactly at 5MB limit", async () => {
      const event = createMockH3Event({});
      const maxSizeBuffer = Buffer.alloc(1024 * 1024 * 5);
      vi.mocked(readMultipartFormData).mockResolvedValue([
        createMockFileData({ data: maxSizeBuffer }),
      ]);

      const result = await uploadImage(event);

      expect(result.size).toBe(1024 * 1024 * 5);
    });
  });

  describe("error handling", () => {
    it("should throw 500 when unexpected error occurs", async () => {
      const event = createMockH3Event({});
      vi.mocked(readMultipartFormData).mockRejectedValue(
        new Error("Unexpected error"),
      );

      await expect(uploadImage(event)).rejects.toMatchObject({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: "Failed to upload image",
      });
    });

    it("should rethrow H3Error without wrapping", async () => {
      const event = createMockH3Event({});
      const h3Error = createError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "Access denied",
      });
      vi.mocked(readMultipartFormData).mockRejectedValue(h3Error);

      await expect(uploadImage(event)).rejects.toMatchObject({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "Access denied",
      });
    });
  });
});
