import mongoose from "mongoose";

export const connectDB = async (
  uri: string,
) => {
  return mongoose.connect(uri);
};
