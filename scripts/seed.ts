/**
 * CLI entry: idempotent MongoDB seed for local Docker / development.
 */
import { pathToFileURL } from "node:url";
import mongoose from "mongoose";
import { runSeed } from "./seed/runSeed";

export async function main(
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  try {
    const summary = await runSeed(env);

    console.log("Seed completed:");
    console.log(`  admin: ${summary.admin}`);
    for (const section of summary.sections) {
      console.log(`  section ${section.slug}: ${section.action}`);
    }
    console.log(`  project: ${summary.project}`);
  } finally {
    await mongoose.connection.close().catch(() => undefined);
  }
}

/** CLI wrapper: maps failures to stderr + process.exitCode (does not throw). */
export async function runSeedCli(
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  try {
    await main(env);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Seed failed: ${message}`);
    process.exitCode = 1;
  }
}

function isCliEntry(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;

  try {
    return import.meta.url === pathToFileURL(entry).href;
  } catch {
    return false;
  }
}

if (isCliEntry()) {
  void runSeedCli();
}
