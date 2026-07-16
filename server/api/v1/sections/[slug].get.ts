import getSingleSection from "~~/server/controllers/sections/getSingleSection";

export default defineEventHandler(async (event) => {
  return await getSingleSection(event);
});
