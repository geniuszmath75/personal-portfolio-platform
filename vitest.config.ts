import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          // Unit tests run outside Nuxt; mirror the #shared alias used in app code.
          alias: {
            "#shared": path.join(root, "shared"),
          },
        },
        test: {
          name: "unit",
          include: ["test/{e2e,unit}/**/*.{test,spec}.ts"],
          environment: "node",
        },
      },
      await defineVitestProject({
        test: {
          name: "nuxt",
          include: ["test/nuxt/**/*.{test,spec}.ts"],
          environment: "nuxt",
        },
      }),
    ],
    coverage: {
      provider: "v8",
      reportsDirectory: "./test/coverage",
      include: ["app/**", "server/**", "shared/**"],
    },
  },
});
