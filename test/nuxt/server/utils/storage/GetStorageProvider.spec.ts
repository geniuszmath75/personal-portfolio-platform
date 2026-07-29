import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { UploadDriver } from "~~/shared/types/enums";
import { useH3TestUtils } from "~~/test/setup";

useH3TestUtils();

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

describe("getStorageProvider", async () => {
  const { getStorageProvider } = await import("~~/server/utils/storage");
  const { LocalStorageProvider } =
    await import("~~/server/utils/storage/local");
  const { S3StorageProvider } = await import("~~/server/utils/storage/s3");

  beforeEach(() => {
    runtimeConfigOverride.value = {
      uploadDriver: UploadDriver.LOCAL,
    };
  });

  it("should return LocalStorageProvider when UPLOAD_DRIVER is local", () => {
    const provider = getStorageProvider();

    expect(provider).toBeInstanceOf(LocalStorageProvider);
  });

  it("should return S3StorageProvider when UPLOAD_DRIVER is s3", () => {
    runtimeConfigOverride.value = {
      uploadDriver: UploadDriver.S3_COMPATIBLE,
      s3Endpoint: "https://example.r2.cloudflarestorage.com",
      s3Region: "auto",
      s3Bucket: "portfolio-dev",
      s3AccessKeyId: "access-key",
      s3SecretAccessKey: "secret-key",
      public: {
        uploadPublicBaseUrl: "cdn.example.com",
      },
    };

    const provider = getStorageProvider();

    expect(provider).toBeInstanceOf(S3StorageProvider);
  });

  it("should throw when UPLOAD_DRIVER is unsupported", () => {
    runtimeConfigOverride.value = {
      uploadDriver: "unknown",
    };

    expect(() => getStorageProvider()).toThrow(
      expect.objectContaining({
        statusCode: 500,
        message: "Unsupported UPLOAD_DRIVER",
      }),
    );
  });
});
