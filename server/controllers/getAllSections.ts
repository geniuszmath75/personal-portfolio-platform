import { Section } from "../models/Section";

export default defineEventHandler(async (event) => {
  const sections = await Section.find();

  return { sections: sections, count: sections.length };
});
