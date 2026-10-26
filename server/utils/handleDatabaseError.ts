import mongoose from "mongoose";
import { createError, H3Error } from "h3";
import { isH3ErrorLike } from "../../server/utils/isH3ErrorLike";

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

const DEFAULT_CUSTOM_ERROR: CustomError = {
  code: 500,
  statusMessage: "Internal Server Error",
  message: "Something went wrong, please try again later.",
};

/**
 *  Handles MongoDB errors and returns a custom error object.
 *
 * @param error - The error object thrown by Mongoose/MongoDB operations.
 * @returns a CustomError object
 */
export const handleDatabaseError = (error: unknown): CustomError => {
  // Default error response
  const customError: CustomError = { ...DEFAULT_CUSTOM_ERROR };

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

  // MongoDB Cast Error
  else if (error instanceof mongoose.Error.CastError) {
    customError.message = `Invalid value for field '${error.path}'`;
    customError.statusMessage = "Bad Request";
    customError.code = 400;
  }

  // Generic Error with message
  else if (error instanceof Error) {
    // Log the error for debugging (in production, use proper logging)
    console.error("Unhandled database error:", error.message, error.stack);
  }

  return customError;
};

/**
 * Re-throws H3 errors as-is; maps unknown/DB errors to a consistent createError shape
 * (`statusCode`, `statusMessage`, `message`) for client `handleError`.
 */
export function rethrowAsHttpError(error: unknown): never {
  if (error instanceof H3Error) {
    throw error;
  }

  if (isH3ErrorLike(error)) {
    const httpError = error as {
      statusCode?: number;
      code?: number;
      statusMessage?: string;
      message?: string;
    };

    throw createError({
      statusCode: httpError.statusCode ?? httpError.code ?? 500,
      statusMessage:
        httpError.statusMessage ?? "Internal Server Error",
      message: httpError.message ?? "Something went wrong, please try again later.",
    });
  }

  const customError = handleDatabaseError(error) ?? { ...DEFAULT_CUSTOM_ERROR };

  throw createError({
    statusCode: customError.code ?? 500,
    statusMessage: customError.statusMessage ?? "Internal Server Error",
    message:
      customError.message ?? "Something went wrong, please try again later.",
  });
}
