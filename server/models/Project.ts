import mongoose from "mongoose";
import type { IProject } from "~~/shared/types";
import type { ProjectModel } from "../types/index.d.ts";
import { ImageSchema } from "./Image";
import { ProjectSourceType, ProjectStatusType } from "../../shared/types/enums";

/**
 * Resolves startDate in endDate validators for both document and update (query) context.
 */
function getStartDateFromValidatorContext(ctx: unknown): Date | undefined {
  if (
    ctx &&
    typeof ctx === "object" &&
    "get" in ctx &&
    typeof ctx.get === "function"
  ) {
    return ctx.get("startDate") as Date | undefined;
  }

  return undefined;
}

const ProjectSchema = new mongoose.Schema<IProject, ProjectModel>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minLength: [3, "Title must be at least 3 characters long."],
      maxLength: [32, "Title must be at most 32 characters long."],
      unique: true,
    },
    technologies: {
      type: [String],
      validate: [
        {
          validator: (arr: string[]) => arr.every((tech) => tech.length > 1),
          message: "Each technology must be at least 1 character long.",
        },
        {
          validator: (arr: string[]) => arr.length > 0,
          message: "At least one technology is required.",
        },
      ],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value: Date) {
          if (!value) return true;

          const startDate = getStartDateFromValidatorContext(this);
          if (!startDate) return true;

          return value > startDate;
        },
        message: "End date must be later than startDate.",
      },
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      maxLength: [64, "Short description must be at most 64 characters long."],
    },
    longDescription: {
      type: String,
      required: [true, "Long description is required"],
      minLength: [64, "Long description must be at least 64 characters long."],
      maxLength: [
        1024,
        "Long description must be at most 1024 characters long.",
      ],
    },
    githubLink: {
      type: String,
      match: [
        /^https:\/\/(?:www\.)?github\.com\/.+$/,
        "GitHub link is not valid",
      ],
      maxLength: [100, "GitHub link must be at most 100 characters long"],
      default: null,
      sparse: true,
    },
    projectSource: {
      type: String,
      enum: ProjectSourceType,
      default: ProjectSourceType.HOBBY,
    },
    websiteLink: {
      type: String,
      match: [
        /^https:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,
        "Website link is not valid",
      ],
      maxLength: [100, "Website link must be at most 100 characters long"],
      default: null,
      sparse: true,
    },
    mainImage: {
      type: ImageSchema,
      required: [true, "Main image is required"],
    },
    otherImages: {
      type: [ImageSchema],
    },
    status: {
      type: String,
      enum: ProjectStatusType,
      default: ProjectStatusType.COMPLETED,
    },
    gainedExperience: {
      type: [String],
      validate: [
        {
          validator: (arr: string[]) => arr.every((exp) => exp.length > 1),
          message:
            "Each experience description must be at least 1 character long.",
        },
        {
          validator: (arr: string[]) => arr.length > 0,
          message: "At least one experience description is required.",
        },
      ],
    },
  },
  { timestamps: true },
);

export const Project: ProjectModel = mongoose.model<IProject, ProjectModel>(
  "Project",
  ProjectSchema,
);
