/**
 * Input for writing a single uploaded object to storage.
 */
export type StoragePutObjectInput = {
  /** Object key relative to the storage root, e.g. `projects/uuid.jpg`. */
  key: string;
  body: Buffer;
  contentType: string;
};

/**
 * Result returned after a successful upload.
 */
export type StoragePutObjectResult = {
  /** Public URL persisted in MongoDB and used in `<img src>`. */
  publicUrl: string;
};

/**
 * Pluggable upload backend (local disk or S3-compatible API such as R2).
 */
export interface StorageProvider {
  putObject(input: StoragePutObjectInput): Promise<StoragePutObjectResult>;
}
