#!/usr/bin/env node
/**
 * Plans safe npm dependency updates: same-major-version only (minor/patch),
 * ordered so packages with no outdated dependency (within the update set)
 * go first, and split into batches you can apply + test incrementally.
 *
 * Usage:
 *   node scripts/checkMinorUpdates.mjs [--batch-size=5]
 *
 * What it does (read-only, no installs are run):
 *   1. Runs `npm outdated --json` to find outdated packages.
 *   2. For each one, queries the registry (`npm view <pkg> versions --json`)
 *      for the highest published version that shares the *current* major
 *      version — even if a newer major exists, so a same-major update isn't
 *      skipped just because `latest` crosses a major boundary.
 *   3. Reads package-lock.json to see which outdated packages depend on
 *      other outdated packages, and orders updates accordingly.
 *   4. Prints ready-to-run `npm install` commands in batches (max N).
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const batchSizeArg = process.argv
  .find((arg) => arg.startsWith("--batch-size="))
  ?.split("=")[1];
const BATCH_SIZE = Math.max(1, Math.min(5, Number(batchSizeArg) || 5));

/** Minimal semver: {major, minor, patch, prerelease}. Ignores build metadata. */
export function parseVersion(raw) {
  const clean = String(raw).trim();
  const [main, prerelease] = clean.split("-", 2);
  const [major, minor, patch] = main.split(".").map((n) => parseInt(n, 10));
  return { major, minor, patch, prerelease, raw: clean };
}

export function isStable(version) {
  return !version.prerelease && Number.isFinite(version.major);
}

/** Ascending compare; ignores prerelease ordering (stable versions only). */
export function compareVersions(a, b) {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

export function readOutdated() {
  let stdout;
  try {
    stdout = execFileSync("npm", ["outdated", "--json"], {
      cwd: ROOT,
      encoding: "utf8",
    });
  } catch (error) {
    // `npm outdated` exits with code 1 when there ARE outdated packages —
    // that's expected, the JSON is still on stdout.
    stdout = error.stdout;
  }

  if (!stdout || !stdout.trim()) return {};
  return JSON.parse(stdout);
}

export function readPublishedVersions(name) {
  const stdout = execFileSync("npm", ["view", name, "versions", "--json"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  const parsed = JSON.parse(stdout);
  return Array.isArray(parsed) ? parsed : [parsed];
}

/** Highest published version with the same major as `current`, if any. */
export function findSameMajorTarget(current, publishedVersions) {
  const candidates = publishedVersions
    .map(parseVersion)
    .filter(isStable)
    .filter((v) => v.major === current.major)
    .filter((v) => compareVersions(v, current) > 0)
    .sort(compareVersions);

  return candidates.at(-1) ?? null;
}

export function readLockfile() {
  const raw = readFileSync(path.join(ROOT, "package-lock.json"), "utf8");
  return JSON.parse(raw);
}

/** Direct dependency names of `name`'s installed version, per package-lock.json. */
export function directDependenciesOf(name, lockPackages) {
  const direct = lockPackages[`node_modules/${name}`];
  const entry =
    direct ??
    Object.entries(lockPackages).find(([key]) =>
      key.endsWith(`/node_modules/${name}`),
    )?.[1];

  if (!entry) return [];

  return Object.keys({
    ...entry.dependencies,
    ...entry.peerDependencies,
  });
}

/** Longest dependency chain within `updateSet` ending at `name` (0 = leaf). */
export function levelOf(name, edges, memo, visiting) {
  if (memo.has(name)) return memo.get(name);
  if (visiting.has(name)) return 0; // defensive cycle guard

  visiting.add(name);
  let level = 0;
  for (const dep of edges.get(name) ?? []) {
    level = Math.max(level, levelOf(dep, edges, memo, visiting) + 1);
  }
  visiting.delete(name);

  memo.set(name, level);
  return level;
}

/** Tiny union-find so "update together" pairs resolve to one group id. */
export function createUnionFind(names) {
  const parent = new Map(names.map((name) => [name, name]));

  function find(name) {
    while (parent.get(name) !== name) {
      name = parent.get(name);
    }
    return name;
  }

  function union(a, b) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent.set(rootA, rootB);
  }

  return { find, union };
}

/**
 * Chunks `sorted` into batches of at most `size`, but never splits a
 * "together" group across batches (a group may push a batch slightly over
 * `size` — acceptable, since groups here are small, tightly-coupled pairs).
 */
export function chunkKeepingGroupsTogether(sorted, size, together) {
  const placed = new Set();
  const batches = [];
  let current = [];

  for (const pkg of sorted) {
    if (placed.has(pkg.name)) continue;

    if (current.length >= size) {
      batches.push(current);
      current = [];
    }

    current.push(pkg);
    placed.add(pkg.name);

    for (const partnerName of together.get(pkg.name) ?? []) {
      if (placed.has(partnerName)) continue;
      const partner = sorted.find((p) => p.name === partnerName);
      if (partner) {
        current.push(partner);
        placed.add(partnerName);
      }
    }
  }

  if (current.length > 0) batches.push(current);
  return batches;
}

/**
 * Orchestrates the whole check. I/O is injectable (defaults to the real
 * `npm`/filesystem calls above) so this can run against fixtures in tests
 * without touching the registry or the real lockfile.
 */
export function main({
  readOutdated: readOutdatedFn = readOutdated,
  readPublishedVersions: readPublishedVersionsFn = readPublishedVersions,
  readLockfile: readLockfileFn = readLockfile,
} = {}) {
  const outdated = readOutdatedFn();
  const names = Object.keys(outdated);

  if (names.length === 0) {
    console.log(
      "Nothing outdated — all packages are on their latest wanted version.",
    );
    return;
  }

  console.log(
    `Checking ${names.length} outdated package(s) for same-major updates...\n`,
  );

  const updatable = [];
  const skipped = [];

  for (const name of names) {
    const entry = outdated[name];
    if (!entry.current) {
      skipped.push({ name, reason: "not currently installed" });
      continue;
    }

    const current = parseVersion(entry.current);
    const versions = readPublishedVersionsFn(name);
    const target = findSameMajorTarget(current, versions);

    if (!target) {
      skipped.push({
        name,
        reason: `only major update available (current ${entry.current} -> latest ${entry.latest})`,
      });
      continue;
    }

    updatable.push({
      name,
      current: entry.current,
      target: target.raw,
      latest: entry.latest,
      crossesMajor: parseVersion(entry.latest).major > current.major,
    });
  }

  if (skipped.length > 0) {
    console.log("Skipped (needs manual review, no safe same-major update):");
    for (const { name, reason } of skipped) {
      console.log(`  - ${name}: ${reason}`);
    }
    console.log("");
  }

  if (updatable.length === 0) {
    console.log(
      "No package can be safely updated within its current major version.",
    );
    return;
  }

  const lock = readLockfileFn();
  const lockPackages = lock.packages ?? {};
  const updatableNames = new Set(updatable.map((p) => p.name));

  // Raw edges from dependencies + peerDependencies. Some packages (e.g. a
  // monorepo core + its plugin, like vitest <-> @vitest/coverage-v8) list
  // each other as peers pinned to the same version — that's a "must match"
  // relationship, not a "must install first" one, and would otherwise look
  // like a dependency cycle. Treat symmetric pairs as "update together"
  // instead of a directed edge, so they don't affect batch ordering.
  const rawEdges = new Map();
  for (const { name } of updatable) {
    const deps = directDependenciesOf(name, lockPackages).filter((dep) =>
      updatableNames.has(dep),
    );
    rawEdges.set(name, deps);
  }

  const edges = new Map();
  const together = new Map();
  for (const { name } of updatable) {
    const deps = rawEdges.get(name) ?? [];
    const ordered = [];
    const symmetric = [];
    for (const dep of deps) {
      if ((rawEdges.get(dep) ?? []).includes(name)) {
        symmetric.push(dep);
      } else {
        ordered.push(dep);
      }
    }
    edges.set(name, ordered);
    together.set(name, symmetric);
  }

  const rawLevel = new Map();
  for (const { name } of updatable) {
    levelOf(name, edges, rawLevel, new Set());
  }

  // "Together" pairs must end up at the same level, otherwise one could be
  // sorted well before the other and land in a much earlier batch.
  const unionFind = createUnionFind(updatable.map((p) => p.name));
  for (const [name, partners] of together) {
    for (const partner of partners) unionFind.union(name, partner);
  }

  const groupLevel = new Map();
  for (const { name } of updatable) {
    const root = unionFind.find(name);
    groupLevel.set(
      root,
      Math.max(groupLevel.get(root) ?? 0, rawLevel.get(name)),
    );
  }

  const finalLevel = new Map(
    updatable.map(({ name }) => [name, groupLevel.get(unionFind.find(name))]),
  );

  const ordered = [...updatable].sort((a, b) => {
    const levelDiff = finalLevel.get(a.name) - finalLevel.get(b.name);
    return levelDiff !== 0 ? levelDiff : a.name.localeCompare(b.name);
  });

  const batches = chunkKeepingGroupsTogether(ordered, BATCH_SIZE, together);

  console.log(
    `${updatable.length} package(s) safe to update within their current major, in ${batches.length} batch(es):\n`,
  );

  batches.forEach((batch, index) => {
    console.log(`Batch ${index + 1}/${batches.length}:`);
    for (const pkg of batch) {
      const deps = edges.get(pkg.name);
      const sameFamily = together.get(pkg.name);
      const depsNote =
        deps.length > 0 ? ` (depends on: ${deps.join(", ")})` : "";
      const togetherNote =
        sameFamily.length > 0
          ? ` (update together with: ${sameFamily.join(", ")})`
          : "";
      const majorNote = pkg.crossesMajor
        ? ` [latest is major ${pkg.latest}, staying within current major]`
        : "";
      console.log(
        `  ${pkg.name}: ${pkg.current} -> ${pkg.target}${majorNote}${depsNote}${togetherNote}`,
      );
    }

    const installArgs = batch
      .map((pkg) => `${pkg.name}@${pkg.target}`)
      .join(" ");
    console.log(`\n  npm install ${installArgs}`);
    console.log(
      "  npm run lint && npm run test:unit && npm run test:nuxt && npm run build\n",
    );
  });
}

function isCliEntry() {
  const entry = process.argv[1];
  if (!entry) return false;

  try {
    return import.meta.url === pathToFileURL(entry).href;
  } catch {
    return false;
  }
}

if (isCliEntry()) {
  main();
}
