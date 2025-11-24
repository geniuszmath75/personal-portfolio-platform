import mongoose from "mongoose";

/**
 * Represents a custom error object
 */
interface CustomError {
  // HTTP status code
  code?: number;

  // HTTP status message
  statusMessage?: string;

  // Detailed error message
  message?: string;
}

/**
 *  Handles MongoDB errors and returns a custom error object.
 *
 * @param error - The error object thrown by Mongoose/MongoDB operations.
 * @returns a CustomError object
 */
export const handleDatabaseError = (error: unknown): CustomError => {
  // Default error response
  const customError: CustomError = {
    code: 500,
    statusMessage: "Internal Server Error",
    message: "Something went wrong, please try again later.",
  };

  // Mongoose Validation Error
  if (error instanceof mongoose.Error.ValidationError) {
    customError.message = Object.values(error.errors)
      .map((item) => item.message)
      .join("; ");
    customError.statusMessage = "Bad Request";
    customError.code = 400;
  }

  // MongoDB Duplicate Key Error
  else if (
    error instanceof mongoose.mongo.MongoServerError &&
    error.code === 11000
  ) {
    const field = Object.keys(error.keyValue)[0];
    customError.message = `Duplicate value entered for ${field} field, please choose another value.`;
    customError.statusMessage = "Bad Request";
    customError.code = 400;
  }

  return customError;
};
