import mongoose from "mongoose";

/**
 * Lightweight liveness probe for Docker / reverse-proxy healthchecks.
 */
export default defineEventHandler(() => {
  const mongoReady = mongoose.connection.readyState === 1;

  return {
    ok: true,
    mongo: mongoReady ? "connected" : "disconnected",
  };
});
