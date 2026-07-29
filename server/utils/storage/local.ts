import { dirname, join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import type {
  StorageProvider,
  StoragePutObjectInput,
  StoragePutObjectResult,
} from "~~/server/utils/storage/types";

/**
 * Writes uploads under `public/uploads/` and returns site-relative URLs
 * Used for local development and Docker volumes.
 */
export class LocalStorageProvider implements StorageProvider {
  async putObject(
    input: StoragePutObjectInput,
  ): Promise<StoragePutObjectResult> {
    const filePath = join(process.cwd(), "public", "uploads", input.key);

    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, input.body);

    return {
      publicUrl: `/uploads/${input.key}`,
    };
  }
}
