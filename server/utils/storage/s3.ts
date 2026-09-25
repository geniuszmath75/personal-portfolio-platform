import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type {
  StorageProvider,
  StoragePutObjectInput,
  StoragePutObjectResult,
} from "~~/server/utils/storage/types";

/** Strip leading/trailing slashes from CDN host or path prefix. */
function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}

/**
 * Join UPLOAD_PUBLIC_BASE_URL with an object key.
 * Accepts a bare host (`cdn.example.com`) or an absolute URL (`https://...`).
 */
function toPublicObjectUrl(baseUrl: string, key: string): string {
  const base = trimSlashes(baseUrl.trim());
  const objectKey = key.replace(/^\/+/g, "");
  const withProtocol = /^https?:\/\//i.test(base) ? base : `https://${base}`;
  return `${withProtocol}/${objectKey}`;
}

/**
 * Stores objects via the S3 API (AWS S3, Cloudflare R2, MinIO, etc.)
 */
export class S3StorageProvider implements StorageProvider {
  /** S3 client instance */
  private readonly client: S3Client;
  /** S3 bucket name */
  private readonly bucket: string;
  /** URL used to build public URLs for uploaded objects */
  private readonly publicBaseUrl: string;

  constructor() {
    const config = useRuntimeConfig();

    // Validate required S3 configuration
    if (!config.s3Endpoint || !config.s3Region || !config.s3Bucket) {
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: "S3 storage is not configured properly",
      });
    }

    // Assign S3 bucket and public base URL
    this.bucket = config.s3Bucket;
    this.publicBaseUrl = trimSlashes(config.public.uploadPublicBaseUrl);

    // Initialize S3 client
    this.client = new S3Client({
      region: config.s3Region,
      endpoint: config.s3Endpoint,
      credentials: {
        accessKeyId: config.s3AccessKeyId,
        secretAccessKey: config.s3SecretAccessKey,
      },
      // R2: leave false (virtual-hosted). Path-style embeds the bucket name
      // into the object key (`bucket/projects/...`), so public CDN URLs 404.
      // MinIO often needs forcePathStyle: true — set via a dedicated env later
      // if you add a MinIO driver profile.
      forcePathStyle: false,
    });
  }

  async putObject(
    input: StoragePutObjectInput,
  ): Promise<StoragePutObjectResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
      }),
    );

    if (!this.publicBaseUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: "UPLOAD_PUBLIC_BASE_URL is required for S3 driver",
      });
    }

    return {
      publicUrl: toPublicObjectUrl(this.publicBaseUrl, input.key),
    };
  }
}
