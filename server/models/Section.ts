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
      required: true,
      minLength: 1,
    },
  },
  { _id: false },
);

const ImageBlockSchema = new mongoose.Schema<ImageBlock>(
  {
    images: {
      type: [String],
      required: true,
      minLength: 5,
    },
  },
  { _id: false },
);

const ButtonBlockSchema = new mongoose.Schema<ButttonBlock>(
  {
    buttons: {
      type: [String],
      required: true,
      minLength: 1,
    },
  },
  { _id: false },
);

const GroupBlockItemSchema = new mongoose.Schema<GroupBlockItem>(
  {
    icon: {
      type: String,
      required: true,
      minLength: 1,
    },
    label: {
      type: String,
      required: true,
      minLength: 1,
    },
  },
  { _id: false },
);

const GroupBlockSchema = new mongoose.Schema<GroupBlock>(
  {
    header: {
      type: String,
      required: false,
      minLength: 1,
    },
    items: [GroupBlockItemSchema],
  },
  { _id: false },
);

const BaseBlockSchema = new mongoose.Schema<BaseBlock>(
  {
    kind: {
      type: String,
      required: true,
    },
  },
  { _id: false, discriminatorKey: "kind" },
);

const SectionSchema = new mongoose.Schema<ISection, SectionModel>({
  title: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 64,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    enum: ISectionType,
    default: ISectionType.HERO,
  },
  order: {
    type: Number,
    required: true,
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
