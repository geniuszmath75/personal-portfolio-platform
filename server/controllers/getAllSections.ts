import { Section } from "../models/Section";

export default defineEventHandler(async (event) => {
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
});
