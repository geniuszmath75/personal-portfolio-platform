import mongoose from "mongoose";
import { ISectionType, BlockKind } from "../../shared/types/enums";
import type {
  ISection,
  Block,
  ParagraphBlock,
  ImageBlock,
  ButttonBlock,
  GroupBlockItem,
  GroupBlock,
} from "~~/shared/types/index.d.ts";
import type { SectionModel } from "~~/server/types";
import { ImageSchema } from "./Image";

const ParagraphBlockSchema = new mongoose.Schema<ParagraphBlock>(
  {
    paragraphs: {
      type: [String],
      validate: [
        {
          validator: (arr: string[]) =>
            arr.every((paragraph) => paragraph.length >= 1),
          message: "Each paragraph must be at least 1 character long.",
        },
        {
          validator: (arr: string[]) => arr.length > 0,
          message: "At least one paragraph is required.",
        },
      ],
    },
  },
  { _id: false },
);

const ImageBlockSchema = new mongoose.Schema<ImageBlock>(
  {
    images: {
      type: [ImageSchema],
      validate: [
        {
          validator: (arr) => arr.length > 0,
          message: "At least one image is required.",
        },
      ],
    },
  },
  { _id: false },
);

const ButtonBlockSchema = new mongoose.Schema<ButttonBlock>(
  {
    buttons: {
      type: [String],
      validate: [
        {
          validator: (arr: string[]) => arr.every((img) => img.length >= 1),
          message: "Each button must be at least 1 character long.",
        },
        {
          validator: (arr: string[]) => arr.length > 0,
          message: "At least one button is required.",
        },
      ],
    },
  },
  { _id: false },
);

const GroupBlockItemSchema = new mongoose.Schema<GroupBlockItem>(
  {
    icon: {
      type: String,
      required: [true, "Icon is required."],
    },
    label: {
      type: String,
      required: [true, "Label is required."],
    },
  },
  { _id: false },
);

const GroupBlockSchema = new mongoose.Schema<GroupBlock>(
  {
    header: {
      type: String,
      minLength: [1, "Group block header must be at least 1 character long."],
    },
    items: {
      type: [GroupBlockItemSchema],
      validate: [
        {
          validator: (arr: GroupBlockItem[]) => arr.length > 0,
          message: "At least one item is required.",
        },
      ],
    },
  },
  { _id: false },
);

const BaseBlockSchema = new mongoose.Schema<Block>(
  {
    kind: {
      type: String,
      required: [true, "Base block kind is required."],
    },
  },
  { _id: false, discriminatorKey: "kind" },
);

const SectionSchema = new mongoose.Schema<ISection, SectionModel>(
  {
    title: {
      type: String,
      minLength: [3, "Title must be at least 3 character long."],
      maxLength: [64, "Title must be at most 64 character long."],
      default: null,
    },
    slug: {
      type: String,
      minLength: [2, "Slug must be at least 2 characters long."],
      maxLength: [50, "Slug must be at most 50 characters long."],
      required: [true, "Slug is required"],
      unique: true,
    },
    type: {
      type: String,
      enum: ISectionType,
      default: ISectionType.HERO,
    },
    order: {
      type: Number,
      required: [true, "Order is required"],
    },
    blocks: {
      type: [BaseBlockSchema],
      validate: [
        {
          validator: (arr: Block[]) => arr.length > 0,
          message: "At least one block is required.",
        },
      ],
    },
  },
  { timestamps: true },
);

// Discriminators for different block types
SectionSchema.path<mongoose.Schema.Types.Subdocument>("blocks").discriminator(
  BlockKind.PARAGRAPH,
  ParagraphBlockSchema,
);
SectionSchema.path<mongoose.Schema.Types.Subdocument>("blocks").discriminator(
  BlockKind.IMAGE,
  ImageBlockSchema,
);
SectionSchema.path<mongoose.Schema.Types.Subdocument>("blocks").discriminator(
  BlockKind.BUTTON,
  ButtonBlockSchema,
);
SectionSchema.path<mongoose.Schema.Types.Subdocument>("blocks").discriminator(
  BlockKind.GROUP,
  GroupBlockSchema,
);

export const Section: SectionModel = mongoose.model<ISection, SectionModel>(
  "Section",
  SectionSchema,
);
