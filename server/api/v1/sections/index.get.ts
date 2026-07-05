import getAllSections from "~~/server/controllers/sections/getAllSections";

export default defineEventHandler(async (event) => {
  return await getAllSections(event);
});
