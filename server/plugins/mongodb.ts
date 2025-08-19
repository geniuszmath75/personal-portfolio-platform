import { connectDB } from "../db/connect";

/**
 * Nitro plugin to connect to MongoDB
 */
export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig();

  try {
    await connectDB(config.mongoDbUri);
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
});
