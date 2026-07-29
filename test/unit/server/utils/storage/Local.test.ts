import { beforeEach, describe, expect, it, vi } from "vitest";
import { vol } from "memfs";

vi.mock("node:fs/promises", async () => {
  const { fs } = await import("memfs");
  return {
    default: fs.promises,
    ...fs.promises,
  };
});

describe("LocalStorageProvider", async () => {
  beforeEach(() => {
    vol.reset();
    vi.spyOn(process, "cwd").mockReturnValue("/app");
  });

  const { LocalStorageProvider } =
    await import("../../../../../server/utils/storage/local");

  it("should write file under public/uploads and return a relative URL", async () => {
    const provider = new LocalStorageProvider();
    const body = Buffer.from("image-data");

    const result = await provider.putObject({
      key: "projects/test-uuid.jpg",
      body,
      contentType: "image/jpeg",
    });

    expect(result.publicUrl).toBe("/uploads/projects/test-uuid.jpg");
    expect(
      vol.readFileSync("/app/public/uploads/projects/test-uuid.jpg"),
    ).toEqual(body);
  });
});
