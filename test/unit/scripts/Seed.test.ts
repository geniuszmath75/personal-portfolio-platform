import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { User } from "../../../server/models/User";
import { Section } from "../../../server/models/Section";
import { Project } from "../../../server/models/Project";
import { UserSchemaRole } from "../../../shared/types/enums";
import {
  isSeedResetAdmin,
  requireSeedAdminCredentials,
  resolveMongoUri,
} from "../../../scripts/seed/env";
import { runSeed } from "../../../scripts/seed/runSeed";
import { main, runSeedCli } from "../../../scripts/seed";
import {
  SEED_PROJECT_TITLE,
  SEED_SECTION_SLUGS,
} from "../../../scripts/seed/data";

describe("seed env helpers", () => {
  it("should resolve NUXT_MONGO_DB_URI over MONGODB_URI", () => {
    expect(
      resolveMongoUri({
        NUXT_MONGO_DB_URI: "mongodb://mongo:27017/app",
        MONGODB_URI: "mongodb://127.0.0.1:27017/app",
      }),
    ).toBe("mongodb://mongo:27017/app");
  });

  it("should require admin email and password", () => {
    expect(() => requireSeedAdminCredentials({})).toThrow(/SEED_ADMIN_EMAIL/);
    expect(() =>
      requireSeedAdminCredentials({ SEED_ADMIN_EMAIL: "a@b.com" }),
    ).toThrow(/SEED_ADMIN_PASSWORD/);
  });

  it("should parse SEED_RESET_ADMIN flags", () => {
    expect(isSeedResetAdmin({ SEED_RESET_ADMIN: "true" })).toBe(true);
    expect(isSeedResetAdmin({ SEED_RESET_ADMIN: "1" })).toBe(true);
    expect(isSeedResetAdmin({ SEED_RESET_ADMIN: "false" })).toBe(false);
  });
});

describe("runSeed", () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
  }, 60_000);

  afterAll(async () => {
    await mongoose.connection.close().catch(() => undefined);
    await mongo.stop();
  });

  it("should seed admin, sections, and project idempotently", async () => {
    const env = {
      MONGODB_URI: mongo.getUri(),
      SEED_ADMIN_EMAIL: "admin@example.com",
      SEED_ADMIN_PASSWORD: "ChangeMe1!",
      SEED_RESET_ADMIN: "false",
    };

    const first = await runSeed(env);
    expect(first.admin).toBe("created");
    expect(first.project).toBe("created");
    expect(first.sections).toHaveLength(4);

    expect(await User.countDocuments()).toBe(1);
    expect(await Section.countDocuments()).toBe(4);
    expect(await Project.countDocuments()).toBe(1);

    const admin = await User.findOne({ email: "admin@example.com" });
    expect(admin?.role).toBe(UserSchemaRole.ADMIN);
    expect(admin?.password).not.toBe("ChangeMe1!");

    const second = await runSeed(env);
    expect(second.admin).toBe("unchanged");
    expect(second.project).toBe("updated");
    expect(second.sections.every((s) => s.action === "updated")).toBe(true);

    expect(await User.countDocuments()).toBe(1);
    expect(await Section.countDocuments()).toBe(4);
    expect(await Project.findOne({ title: SEED_PROJECT_TITLE })).toBeTruthy();
    expect(
      await Section.findOne({ slug: SEED_SECTION_SLUGS.aboutMe }),
    ).toBeTruthy();
  }, 60_000);

  it("should reset admin password when SEED_RESET_ADMIN is true", async () => {
    const env = {
      MONGODB_URI: mongo.getUri(),
      SEED_ADMIN_EMAIL: "reset-admin@example.com",
      SEED_ADMIN_PASSWORD: "ChangeMe1!",
      SEED_RESET_ADMIN: "false",
    };

    await runSeed(env);
    const before = await User.findOne({ email: "reset-admin@example.com" });
    const hashBefore = before?.password;

    const reset = await runSeed({
      ...env,
      SEED_ADMIN_PASSWORD: "NewPass1!",
      SEED_RESET_ADMIN: "true",
    });

    expect(reset.admin).toBe("updated");
    const after = await User.findOne({ email: "reset-admin@example.com" });
    expect(after?.password).not.toBe(hashBefore);
    expect(await after?.comparePassword("NewPass1!")).toBe(true);
  }, 60_000);
});

describe("scripts/seed.ts CLI", () => {
  let mongo: MongoMemoryServer;
  const previousExitCode = process.exitCode;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
  }, 60_000);

  afterAll(async () => {
    process.exitCode = previousExitCode;
    await mongoose.connection.close().catch(() => undefined);
    await mongo.stop();
  });

  it("should log a summary and close the mongoose connection", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await main({
      MONGODB_URI: mongo.getUri(),
      SEED_ADMIN_EMAIL: "cli-admin@example.com",
      SEED_ADMIN_PASSWORD: "ChangeMe1!",
      SEED_RESET_ADMIN: "false",
    });

    expect(log.mock.calls.flat().join("\n")).toMatch(/Seed completed:/);
    expect(log.mock.calls.flat().join("\n")).toMatch(/admin: created/);
    expect(log.mock.calls.flat().join("\n")).toMatch(/project: created/);
    expect(mongoose.connection.readyState).toBe(0);

    log.mockRestore();
  }, 60_000);

  it("should set exitCode and log failures without leaking the password", async () => {
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    process.exitCode = undefined;

    const password = "SuperSecret1!";
    await runSeedCli({
      SEED_ADMIN_EMAIL: "cli-fail@example.com",
      SEED_ADMIN_PASSWORD: password,
      // missing Mongo URI on purpose
    });

    expect(process.exitCode).toBe(1);
    const logged = error.mock.calls.flat().join("\n");
    expect(logged).toMatch(/Seed failed:/);
    expect(logged).toMatch(/NUXT_MONGO_DB_URI|MONGODB_URI/);
    expect(logged).not.toContain(password);

    error.mockRestore();
  });
});
