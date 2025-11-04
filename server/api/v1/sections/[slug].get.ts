import getSingleSection from "~~/server/controllers/getSingleSection";

export default defineEventHandler(async (event) => {
  return await getSingleSection(event);
});
