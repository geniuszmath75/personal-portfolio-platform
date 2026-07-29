import { UploadDriver } from "~~/shared/types/enums";
import { LocalStorageProvider } from "./local";
import { S3StorageProvider } from "./s3";
import type { StorageProvider } from "./types";

/**
 * Resolves the active upload backend from `UPLOAD_DRIVER` runtime config.
 */
export function getStorageProvider(): StorageProvider {
  const config = useRuntimeConfig();
  const driver = config.uploadDriver;

  switch (driver) {
    case UploadDriver.LOCAL:
      return new LocalStorageProvider();
    case UploadDriver.S3_COMPATIBLE:
      return new S3StorageProvider();
    default:
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: "Unsupported UPLOAD_DRIVER",
      });
  }
}
