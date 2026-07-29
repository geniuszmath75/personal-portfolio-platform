import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useH3TestUtils } from "~~/test/setup";

useH3TestUtils();

const {
  sendMock,
  capturedPutInputs,
  capturedS3ClientConfigs,
  S3ClientMock,
  PutObjectCommandMock,
} = vi.hoisted(() => {
  const sendMock = vi.fn();
  const capturedPutInputs: unknown[] = [];
  const capturedS3ClientConfigs: unknown[] = [];

  // Function constructor so `new PutObjectCommand(...)` works without an
  // extraneous class
  function PutObjectCommand(this: unknown, input: unknown) {
    capturedPutInputs.push(input);
  }

  const S3Client = vi.fn(function (
    this: { send: typeof sendMock },
    config: unknown,
  ) {
    capturedS3ClientConfigs.push(config);
    this.send = sendMock;
  });

  return {
    sendMock,
    capturedPutInputs,
    capturedS3ClientConfigs,
    S3ClientMock: S3Client,
    PutObjectCommandMock: PutObjectCommand,
  };
});

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: S3ClientMock,
  PutObjectCommand: PutObjectCommandMock,
}));

const { runtimeConfigOverride } = vi.hoisted(() => ({
  runtimeConfigOverride: {
    value: null as Record<string, unknown> | null,
  },
}));

mockNuxtImport("useRuntimeConfig", (original) => {
  return () => {
    const base = original();
    if (!runtimeConfigOverride.value) {
      return base;
    }

    return {
      ...base,
      ...runtimeConfigOverride.value,
      public: {
        ...base.public,
        ...(runtimeConfigOverride.value.public as object | undefined),
      },
    };
  };
});

const validS3Config = {
  s3Endpoint: "https://account.r2.cloudflarestorage.com",
  s3Region: "auto",
  s3Bucket: "portfolio-dev",
  s3AccessKeyId: "test-access-key-id",
  s3SecretAccessKey: "test-secret-access-key",
  public: {
    uploadPublicBaseUrl: "cdn.example.com",
  },
};

describe("S3StorageProvider", async () => {
  const { S3StorageProvider } = await import("~~/server/utils/storage/s3");

  beforeEach(() => {
    vi.clearAllMocks();
    sendMock.mockResolvedValue(undefined);
    capturedPutInputs.length = 0;
    capturedS3ClientConfigs.length = 0;
    runtimeConfigOverride.value = { ...validS3Config };
  });

  describe("constructor", () => {
    it("should initialize S3Client with runtime config and forcePathStyle", () => {
      new S3StorageProvider();

      expect(S3ClientMock).toHaveBeenCalledWith({
        region: "auto",
        endpoint: "https://account.r2.cloudflarestorage.com",
        credentials: {
          accessKeyId: "test-access-key-id",
          secretAccessKey: "test-secret-access-key",
        },
        forcePathStyle: true,
      });
    });

    it("should throw when s3Endpoint is missing", () => {
      runtimeConfigOverride.value = {
        ...validS3Config,
        s3Endpoint: "",
      };

      expect(() => new S3StorageProvider()).toThrow(
        expect.objectContaining({
          statusCode: 500,
          message: "S3 storage is not configured properly",
        }),
      );
      expect(S3ClientMock).not.toHaveBeenCalled();
    });

    it("should throw when s3Region is missing", () => {
      runtimeConfigOverride.value = {
        ...validS3Config,
        s3Region: "",
      };

      expect(() => new S3StorageProvider()).toThrow(
        expect.objectContaining({
          statusCode: 500,
          message: "S3 storage is not configured properly",
        }),
      );
    });

    it("should throw when s3Bucket is missing", () => {
      runtimeConfigOverride.value = {
        ...validS3Config,
        s3Bucket: "",
      };

      expect(() => new S3StorageProvider()).toThrow(
        expect.objectContaining({
          statusCode: 500,
          message: "S3 storage is not configured properly",
        }),
      );
    });
  });

  describe("putObject", () => {
    it("should upload object and return HTTPS public URL", async () => {
      const provider = new S3StorageProvider();
      const body = Buffer.from("image-data");

      const result = await provider.putObject({
        key: "projects/test-uuid.jpg",
        body,
        contentType: "image/jpeg",
      });

      expect(capturedPutInputs[0]).toEqual({
        Bucket: "portfolio-dev",
        Key: "projects/test-uuid.jpg",
        Body: body,
        ContentType: "image/jpeg",
      });
      expect(sendMock).toHaveBeenCalledTimes(1);
      expect(result.publicUrl).toBe(
        "https://cdn.example.com/projects/test-uuid.jpg",
      );
    });

    it("should trim slashes from UPLOAD_PUBLIC_BASE_URL", async () => {
      runtimeConfigOverride.value = {
        ...validS3Config,
        public: {
          uploadPublicBaseUrl: "/cdn.example.com/",
        },
      };

      const provider = new S3StorageProvider();

      const result = await provider.putObject({
        key: "avatars/avatar.png",
        body: Buffer.from("png"),
        contentType: "image/png",
      });

      expect(result.publicUrl).toBe(
        "https://cdn.example.com/avatars/avatar.png",
      );
    });

    it("should throw when UPLOAD_PUBLIC_BASE_URL is missing after upload", async () => {
      runtimeConfigOverride.value = {
        ...validS3Config,
        public: {
          uploadPublicBaseUrl: "",
        },
      };

      const provider = new S3StorageProvider();

      await expect(
        provider.putObject({
          key: "projects/test.jpg",
          body: Buffer.from("data"),
          contentType: "image/jpeg",
        }),
      ).rejects.toMatchObject({
        statusCode: 500,
        message: "UPLOAD_PUBLIC_BASE_URL is required for S3 driver",
      });

      expect(sendMock).toHaveBeenCalledTimes(1);
    });

    it("should propagate errors from S3 client", async () => {
      sendMock.mockRejectedValueOnce(new Error("Network failure"));

      const provider = new S3StorageProvider();

      await expect(
        provider.putObject({
          key: "projects/fail.jpg",
          body: Buffer.from("data"),
          contentType: "image/jpeg",
        }),
      ).rejects.toThrow("Network failure");
    });
  });
});
