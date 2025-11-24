import { User } from "../models/User";
import { handleDatabaseError } from "../utils/handleDatabaseError";

export default defineEventHandler(async (event) => {
  try {
    const { username, email, password } = await readBody(event);

    await User.create({ username, email, password });

    setResponseStatus(event, 201);
    return { user: { username, email } };
  } catch (error) {
    const customError = handleDatabaseError(error);

    throw createError({
      statusCode: customError.code,
      statusMessage: customError.statusMessage,
      message: customError.message,
    });
  }
});
