import createSection from "~~/server/controllers/sections/createSection";

export default defineEventHandler(async (event) => {
  return await createSection(event);
});
