import mongoose from "mongoose";
import { ISectionType, BlockKind } from "../types/enums";
import type {
  ISection,
  SectionModel,
  ParagraphBlock,
  ImageBlock,
  ButttonBlock,
  GroupBlockItem,
  GroupBlock,
  BaseBlock,
} from "../types/index.d.ts";

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
      type: [String],
      validate: [
        {
          validator: (arr: string[]) => arr.every((img) => img.length >= 5),
          message: "Each image must be at least 5 character long.",
        },
        {
          validator: (arr: string[]) => arr.length > 0,
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
    items: [GroupBlockItemSchema],
  },
  { _id: false },
);

const BaseBlockSchema = new mongoose.Schema<BaseBlock>(
  {
    kind: {
      type: String,
      required: [true, "Base block kind is required."],
    },
  },
  { _id: false, discriminatorKey: "kind" },
);

const SectionSchema = new mongoose.Schema<ISection, SectionModel>({
  title: {
    type: String,
    required: [true, "Title is required"],
    minLength: [3, "Title must be at least 3 character long."],
    maxLength: [64, "Title must be at most 64 character long."],
  },
  slug: {
    type: String,
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
  blocks: [BaseBlockSchema],
});

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
