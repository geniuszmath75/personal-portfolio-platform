import mongoose from "mongoose";

/**
 * Connects to a MongoDB database
 *
 * @async
 * @param uri - The MongoDB connection URI
 * @returns {Promise<mongoose.Mongoose}
 */
export const connectDB = async (uri: string): Promise<mongoose.Mongoose> => {
  return mongoose.connect(uri);
};
