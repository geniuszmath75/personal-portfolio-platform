import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserSchemaRole } from "../types/enums";
import type { UserModel, IUser, IUserMethods } from "../types/index.d.ts";

const UserSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Email is not valid",
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [8, "Password must be at least 8 characters long"],
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    minLength: [3, "Username must be at least 3 characters long"],
    maxLength: [50, "Username must be at most 50 characters long"],
  },
  role: {
    type: String,
    enum: UserSchemaRole,
    default: UserSchemaRole.ADMIN,
  },
  avatar: {
    type: String,
  },
});

// Create a JWT token for the logged-in user
UserSchema.methods.createJWT = function (): string {
  const { jwtSecret, jwtLifetime } = useRuntimeConfig();
  return jwt.sign(
    { userId: this._id, email: this.email, role: this.role },
    jwtSecret,
    {
      expiresIn: jwtLifetime,
    },
  );
};

// Compare passwords while logging in
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);

  return isMatch;
};

export const User: UserModel = mongoose.model<IUser, UserModel>(
  "User",
  UserSchema,
);
