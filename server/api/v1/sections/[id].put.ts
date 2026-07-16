import updateSection from "~~/server/controllers/sections/updateSection";

export default defineEventHandler(async (event) => {
  return await updateSection(event);
});
