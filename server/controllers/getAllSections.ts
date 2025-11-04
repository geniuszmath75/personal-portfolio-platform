import { Section } from "../models/Section";

export default defineEventHandler(async (event) => {
  // Home page sections
  const homeSections = [
    ISectionType.CONTACT,
    ISectionType.HERO,
    ISectionType.SKILLS,
  ];

  const sections = await Section.find({ type: { $in: homeSections } });

  return { sections: sections, count: sections.length };
});
