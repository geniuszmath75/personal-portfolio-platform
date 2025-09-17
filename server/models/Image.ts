import mongoose from "mongoose";
import type { Image } from "~~/shared/types";

export const ImageSchema = new mongoose.Schema<Image>(
  {
    srcPath: {
      type: String,
      required: [true, "Image source path is required"],
      match: [
        /\.(png|jpe?g|webp|svg)$/i,
        "Image source path must point to a valid image file.",
      ],
      minLength: [6, "Image source path must be at least 6 characters long"],
    },
    altText: {
      type: String,
      required: [true, "Alternative text is required"],
    },
  },
  { _id: false },
);
