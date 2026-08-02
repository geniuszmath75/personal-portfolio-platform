/**
 * Env helpers for the DB seed script.
 */

export function resolveMongoUri(env: NodeJS.ProcessEnv = process.env): string {
  const uri = env.NUXT_MONGO_DB_URI?.trim() || env.MONGODB_URI?.trim() || "";

  if (!uri) {
    throw new Error("Missing Mongo URI: set NUXT_MONGO_DB_URI or MONGODB_URI");
  }

  return uri;
}

export function requireSeedAdminCredentials(
  env: NodeJS.ProcessEnv = process.env,
): { email: string; password: string } {
  const email = env.SEED_ADMIN_EMAIL?.trim() || "";
  const password = env.SEED_ADMIN_PASSWORD?.trim() || "";

  if (!email) {
    throw new Error("Missing required env: SEED_ADMIN_EMAIL");
  }

  if (!password) {
    throw new Error("Missing required env: SEED_ADMIN_PASSWORD");
  }

  return { email, password };
}

export function isSeedResetAdmin(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const value = env.SEED_RESET_ADMIN?.trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}
