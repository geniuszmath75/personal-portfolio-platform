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
    match: [
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character",
    ],
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
    default: UserSchemaRole.GUEST,
  },
  avatar: {
    type: String,
    default: null,
  },
});

// Hash password before saving to database
export async function userSchemaPreSave(this: IUser) {
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
}

// Pre-save hook to do some operations before saving a user
UserSchema.pre("save", userSchemaPreSave);

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
