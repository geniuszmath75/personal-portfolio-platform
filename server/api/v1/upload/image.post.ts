import createImage from "~~/server/controllers/upload/createImage";

export default defineEventHandler(async (event) => {
  return await createImage(event);
});
