import { connectDB } from "../../server/db/connect";
import { User } from "../../server/models/User";
import { Section } from "../../server/models/Section";
import { Project } from "../../server/models/Project";
import { seedProject, seedSections, UserSchemaRole } from "./data";
import {
  isSeedResetAdmin,
  requireSeedAdminCredentials,
  resolveMongoUri,
} from "./env";

export type SeedSummary = {
  admin: "created" | "updated" | "unchanged";
  sections: { slug: string; action: "created" | "updated" }[];
  project: "created" | "updated";
};

/**
 * Idempotent seed: admin user, four sections, one sample project.
 */
export async function runSeed(
  env: NodeJS.ProcessEnv = process.env,
): Promise<SeedSummary> {
  const uri = resolveMongoUri(env);
  const { email, password } = requireSeedAdminCredentials(env);
  const resetAdmin = isSeedResetAdmin(env);

  await connectDB(uri);

  return {
    admin: await upsertAdmin(email, password, resetAdmin),
    sections: await upsertSections(),
    project: await upsertProject(),
  };
}

async function upsertAdmin(
  email: string,
  password: string,
  resetPassword: boolean,
): Promise<"created" | "updated" | "unchanged"> {
  const existing = await User.findOne({ email });

  if (!existing) {
    await User.create({
      email,
      password,
      username: "admin",
      role: UserSchemaRole.ADMIN,
    });
    return "created";
  }

  // Avoid document.save() when only role changes: User pre-save always re-hashes
  // password, which would corrupt an existing hash.
  if (resetPassword) {
    existing.password = password;
    existing.role = UserSchemaRole.ADMIN;
    await existing.save();
    return "updated";
  }

  if (existing.role !== UserSchemaRole.ADMIN) {
    await User.updateOne(
      { _id: existing._id },
      { $set: { role: UserSchemaRole.ADMIN } },
    );
    return "updated";
  }

  return "unchanged";
}

async function upsertSections(): Promise<
  { slug: string; action: "created" | "updated" }[]
> {
  const results: { slug: string; action: "created" | "updated" }[] = [];

  for (const section of seedSections) {
    const existing = await Section.findOne({ slug: section.slug });

    if (!existing) {
      await Section.create(section);
      results.push({ slug: section.slug, action: "created" });
      continue;
    }

    existing.title = section.title;
    existing.type = section.type;
    existing.order = section.order;
    existing.blocks = section.blocks;
    await existing.save();
    results.push({ slug: section.slug, action: "updated" });
  }

  return results;
}

async function upsertProject(): Promise<"created" | "updated"> {
  const existing = await Project.findOne({ title: seedProject.title });

  if (!existing) {
    await Project.create(seedProject);
    return "created";
  }

  existing.technologies = seedProject.technologies;
  existing.startDate = seedProject.startDate;
  existing.endDate = seedProject.endDate;
  existing.shortDescription = seedProject.shortDescription;
  existing.longDescription = seedProject.longDescription;
  existing.projectSource = seedProject.projectSource;
  existing.status = seedProject.status;
  existing.githubLink = seedProject.githubLink;
  existing.websiteLink = seedProject.websiteLink;
  existing.mainImage = seedProject.mainImage;
  existing.otherImages = seedProject.otherImages;
  existing.gainedExperience = seedProject.gainedExperience;
  await existing.save();
  return "updated";
}
