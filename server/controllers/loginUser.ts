import { User } from "../models/User";

export default defineEventHandler(async (event) => {
  // Read the request body
  const { email, password } = await readBody(event);

  // Check if email and password are provided
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and password are required",
    });
  }

  // Check if the user exists
  const user = await User.findOne({ email });

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials: User not found",
    });
  }

  // Check if the password is correct
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw createError({
      statusCode: 401,
      statusMessage: "Incorrect password",
    });
  }

  // Create a JWT token for the user
  const token = user.createJWT();

  // Prepare the response
  const response = {
    user: { email: user.email, role: user.role },
    token,
  };

  // Return the response
  return response;
});
