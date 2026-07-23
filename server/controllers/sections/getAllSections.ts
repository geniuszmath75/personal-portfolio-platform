import { Section } from "~~/server/models/Section";
import { rethrowAsHttpError } from "~~/server/utils/handleDatabaseError";

export default defineEventHandler(async (event) => {
  try {
    // Home page sections
    const homeSections = [
      ISectionType.CONTACT,
      ISectionType.HERO,
      ISectionType.SKILLS,
    ];

    const sections = await Section.find({ type: { $in: homeSections } });

    // Transform documents to JSON
    const transformedSections = sections.map((section) => {
      return section.toJSON();
    });

    return { sections: transformedSections, count: sections.length };
  } catch (error) {
    rethrowAsHttpError(error);
  }
});
