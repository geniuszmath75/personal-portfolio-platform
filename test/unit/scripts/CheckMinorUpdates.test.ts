import { afterEach, describe, expect, it, vi } from "vitest";
import {
  chunkKeepingGroupsTogether,
  compareVersions,
  createUnionFind,
  directDependenciesOf,
  findSameMajorTarget,
  isStable,
  levelOf,
  main,
  parseVersion,
} from "../../../scripts/checkMinorUpdates.mjs";

describe("parseVersion", () => {
  it("should parse a stable version into its parts", () => {
    expect(parseVersion("1.2.3")).toMatchObject({
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: undefined,
      raw: "1.2.3",
    });
  });

  it("should split off a prerelease suffix", () => {
    expect(parseVersion("1.2.3-beta.1")).toMatchObject({
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: "beta.1",
    });
  });

  it("should trim surrounding whitespace", () => {
    expect(parseVersion("  1.2.3  ").raw).toBe("1.2.3");
  });
});

describe("isStable", () => {
  it("should be true for a stable, well-formed version", () => {
    expect(isStable(parseVersion("1.2.3"))).toBe(true);
  });

  it("should be false when a prerelease suffix is present", () => {
    expect(isStable(parseVersion("1.2.3-rc.1"))).toBe(false);
  });

  it("should be false when the major version isn't a number", () => {
    expect(isStable(parseVersion("not-a-version"))).toBe(false);
  });
});

describe("compareVersions", () => {
  it("should order ascending by major, then minor, then patch", () => {
    const versions = ["1.9.9", "2.0.0", "1.10.0", "1.2.3"].map(parseVersion);
    versions.sort(compareVersions);
    expect(versions.map((v) => v.raw)).toEqual([
      "1.2.3",
      "1.9.9",
      "1.10.0",
      "2.0.0",
    ]);
  });
});

describe("findSameMajorTarget", () => {
  it("should return the highest published version within the current major", () => {
    const current = parseVersion("1.2.0");
    const target = findSameMajorTarget(current, [
      "1.2.0",
      "1.3.0",
      "1.5.0",
      "2.0.0",
    ]);
    expect(target?.raw).toBe("1.5.0");
  });

  it("should ignore prerelease candidates", () => {
    const current = parseVersion("1.0.0");
    const target = findSameMajorTarget(current, [
      "1.0.0",
      "1.1.0-beta.1",
      "1.1.0",
      "2.0.0",
    ]);
    expect(target?.raw).toBe("1.1.0");
  });

  it("should return null when current is already the newest in its major", () => {
    const current = parseVersion("1.5.0");
    const target = findSameMajorTarget(current, ["1.2.0", "1.5.0", "2.0.0"]);
    expect(target).toBeNull();
  });

  it("should return null when only a major bump is available", () => {
    const current = parseVersion("3.4.0");
    const target = findSameMajorTarget(current, ["3.4.0", "4.0.0", "5.0.0"]);
    expect(target).toBeNull();
  });
});

describe("directDependenciesOf", () => {
  it("should read dependencies + peerDependencies for an exact top-level match", () => {
    const lockPackages = {
      "node_modules/foo": {
        dependencies: { bar: "^1.0.0" },
        peerDependencies: { baz: "^2.0.0" },
      },
    };
    expect(directDependenciesOf("foo", lockPackages)).toEqual(["bar", "baz"]);
  });

  it("should fall back to a nested node_modules entry when no top-level one exists", () => {
    const lockPackages = {
      "node_modules/parent/node_modules/foo": {
        dependencies: { bar: "^1.0.0" },
      },
    };
    expect(directDependenciesOf("foo", lockPackages)).toEqual(["bar"]);
  });

  it("should return an empty array when the package isn't in the lockfile", () => {
    expect(directDependenciesOf("missing", {})).toEqual([]);
  });
});

describe("levelOf", () => {
  it("should return 0 for a leaf with no edges", () => {
    const edges = new Map([["leaf", []]]);
    expect(levelOf("leaf", edges, new Map(), new Set())).toBe(0);
  });

  it("should return the longest chain length for a dependency chain", () => {
    const edges = new Map([
      ["a", ["b"]],
      ["b", ["c"]],
      ["c", []],
    ]);
    expect(levelOf("a", edges, new Map(), new Set())).toBe(2);
    expect(levelOf("b", edges, new Map(), new Set())).toBe(1);
    expect(levelOf("c", edges, new Map(), new Set())).toBe(0);
  });

  it("should not recurse infinitely on a cyclic edge set (defensive guard)", () => {
    const edges = new Map([
      ["a", ["b"]],
      ["b", ["a"]],
    ]);
    const result = levelOf("a", edges, new Map(), new Set());
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe("createUnionFind", () => {
  it("should union two names under a shared root, leaving others separate", () => {
    const uf = createUnionFind(["a", "b", "c"]);
    uf.union("a", "b");
    expect(uf.find("a")).toBe(uf.find("b"));
    expect(uf.find("c")).not.toBe(uf.find("a"));
  });
});

describe("chunkKeepingGroupsTogether", () => {
  it("should split into batches of at most `size` when there are no groups", () => {
    const sorted = ["a", "b", "c", "d", "e"].map((name) => ({ name }));
    const batches = chunkKeepingGroupsTogether(sorted, 2, new Map());
    expect(batches.map((b) => b.map((p) => p.name))).toEqual([
      ["a", "b"],
      ["c", "d"],
      ["e"],
    ]);
  });

  it("should keep a 'together' group in the same batch even past `size`", () => {
    const sorted = ["a", "b", "c"].map((name) => ({ name }));
    const together = new Map([["a", ["b"]]]);
    const batches = chunkKeepingGroupsTogether(sorted, 1, together);
    expect(batches.map((b) => b.map((p) => p.name))).toEqual([
      ["a", "b"],
      ["c"],
    ]);
  });
});

describe("main", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should report early when nothing is outdated", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const readPublishedVersions = vi.fn();
    const readLockfile = vi.fn();

    main({
      readOutdated: () => ({}),
      readPublishedVersions,
      readLockfile,
    });

    expect(log.mock.calls.flat().join("\n")).toMatch(/Nothing outdated/);
    expect(readPublishedVersions).not.toHaveBeenCalled();
    expect(readLockfile).not.toHaveBeenCalled();
  });

  it("should skip packages that aren't installed or only have a major update", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const readLockfile = vi.fn();

    main({
      readOutdated: () => ({
        "not-installed-pkg": { latest: "2.0.0" },
        "major-only-pkg": { current: "3.4.0", latest: "5.0.0" },
      }),
      readPublishedVersions: (name: string) =>
        name === "major-only-pkg" ? ["3.4.0", "4.0.0", "5.0.0"] : [],
      readLockfile,
    });

    const output = log.mock.calls.flat().join("\n");
    expect(output).toMatch(/not-installed-pkg: not currently installed/);
    expect(output).toMatch(
      /major-only-pkg: only major update available \(current 3\.4\.0 -> latest 5\.0\.0\)/,
    );
    expect(output).toMatch(
      /No package can be safely updated within its current major version\./,
    );
    // Nothing was updatable, so batching never needs the lockfile.
    expect(readLockfile).not.toHaveBeenCalled();
  });

  it("should order by same-major dependency depth and group symmetric peers together", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    const publishedVersions: Record<string, string[]> = {
      "leaf-pkg": ["1.2.0", "1.3.0", "1.5.0"],
      "dependent-pkg": ["2.0.0", "2.1.0", "2.3.0"],
      "peer-a": ["4.1.10", "4.1.11"],
      "peer-b": ["4.1.10", "4.1.11"],
      "major-cross-pkg": ["1.0.0", "1.1.0", "2.0.0", "3.0.0"],
    };

    main({
      readOutdated: () => ({
        "leaf-pkg": { current: "1.2.0", latest: "1.5.0" },
        "dependent-pkg": { current: "2.0.0", latest: "2.3.0" },
        "peer-a": { current: "4.1.10", latest: "4.1.11" },
        "peer-b": { current: "4.1.10", latest: "4.1.11" },
        "major-cross-pkg": { current: "1.0.0", latest: "3.0.0" },
      }),
      readPublishedVersions: (name: string) => publishedVersions[name],
      readLockfile: () => ({
        packages: {
          "node_modules/leaf-pkg": {},
          "node_modules/dependent-pkg": {
            dependencies: { "leaf-pkg": "^1.2.0" },
          },
          "node_modules/peer-a": {
            peerDependencies: { "peer-b": "4.1.10" },
          },
          "node_modules/peer-b": {
            peerDependencies: { "peer-a": "4.1.10" },
          },
          "node_modules/major-cross-pkg": {},
        },
      }),
    });

    const output = log.mock.calls.flat().join("\n");

    expect(output).toMatch(
      /5 package\(s\) safe to update within their current major, in 1 batch\(es\)/,
    );

    // The leaf dependency is placed before the package that depends on it.
    expect(output.indexOf("leaf-pkg:")).toBeLessThan(
      output.indexOf("dependent-pkg:"),
    );
    expect(output).toMatch(/dependent-pkg: .* \(depends on: leaf-pkg\)/);

    // Symmetric peers (e.g. vitest <-> @vitest/coverage-v8 style pairs) are
    // flagged as "update together", not ordered as a dependency chain.
    expect(output).toMatch(/peer-a: .*update together with: peer-b/);
    expect(output).toMatch(/peer-b: .*update together with: peer-a/);

    // A same-major target still exists even though `latest` crosses a major.
    expect(output).toMatch(
      /major-cross-pkg: 1\.0\.0 -> 1\.1\.0 \[latest is major 3\.0\.0, staying within current major\]/,
    );

    expect(output).toMatch(
      /npm install .*leaf-pkg@1\.5\.0.*dependent-pkg@2\.3\.0/,
    );
  });
});
