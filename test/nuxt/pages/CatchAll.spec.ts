import { describe, expect, it } from "vitest";
import { renderWithNuxt } from "~~/test/setup";
import CatchAllPage from "~/pages/[...path].vue";

describe("pages/[...path] catch-all", () => {
  it("should throw a fatal 404 on setup", () => {
    try {
      renderWithNuxt(CatchAllPage);
      expect.unreachable("expected createError 404 to be thrown");
    } catch (error) {
      expect(error).toMatchObject({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Page not found",
      });
    }
  });
});
