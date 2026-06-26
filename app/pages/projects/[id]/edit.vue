<template>
  <div class="bg-primary-500 min-h-screen py-20 px-8">
    <h2
      class="text-2xl md:text-4xl font-bold text-secondary-500 text-center my-12"
    >
      Edit project
    </h2>

    <ProjectForm
      mode="edit"
      :form="form"
      :on-submit="submitUpdateProject"
      :is-submitting="isSubmitting"
      :on-main-image-change="handleMainImageChange"
      :on-other-images-change="handleOtherImagesChange"
      :main-image-file-list="initialMainImageFileList"
      :other-images-file-list="initialOtherImagesFileList"
      :on-main-image-file-list-update="handleMainImageFileListUpdate"
      :on-other-images-file-list-update="handleOtherImagesFileListUpdate"
      :technologies-errors="technologiesErrors"
      :add-technology="addTechnology"
      :remove-technology="removeTechnology"
      :gained-experience-errors="gainedExperienceErrors"
      :add-experience="addExperience"
      :remove-experience="removeExperience"
      :touch-field="touchField"
      :title-errors="titleErrors"
      :short-description-errors="shortDescriptionErrors"
      :long-description-errors="longDescriptionErrors"
      :start-date-errors="startDateErrors"
      :github-link-errors="githubLinkErrors"
      :website-link-errors="websiteLinkErrors"
      :is-title-invalid="isTitleInvalid"
      :is-short-description-invalid="isShortDescriptionInvalid"
      :is-long-description-invalid="isLongDescriptionInvalid"
      :is-start-date-invalid="isStartDateInvalid"
      :is-github-link-invalid="isGithubLinkInvalid"
      :is-website-link-invalid="isWebsiteLinkInvalid"
    />
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  middleware: ["02-admin"],
});

const projectStore = useProjectsStore();
const projectId = useRouteParam("id");

await callOnce("project", () => projectStore.fetchProject(projectId), {
  mode: "navigation",
});

const {
  form,
  submitUpdateProject,
  isSubmitting,
  handleMainImageChange,
  handleOtherImagesChange,
  initialMainImageFileList,
  initialOtherImagesFileList,
  addTechnology,
  removeTechnology,
  addExperience,
  removeExperience,
  touchField,
  technologiesErrors,
  gainedExperienceErrors,
  titleErrors,
  shortDescriptionErrors,
  longDescriptionErrors,
  startDateErrors,
  githubLinkErrors,
  websiteLinkErrors,
  isTitleInvalid,
  isShortDescriptionInvalid,
  isLongDescriptionInvalid,
  isStartDateInvalid,
  isGithubLinkInvalid,
  isWebsiteLinkInvalid,
  handleMainImageFileListUpdate,
  handleOtherImagesFileListUpdate,
} = useUpdateProjectForm(projectId);
</script>
