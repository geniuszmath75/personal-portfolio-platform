import getAllSections from "~~/server/controllers/getAllSections"

export default defineEventHandler(async (event) => {
    return await getAllSections(event);
})