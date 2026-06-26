<template>
  <div class="bg-primary-500 min-h-screen py-20 px-8">
    <h2
      class="text-2xl md:text-4xl font-bold text-secondary-500 text-center my-12"
    >
      Create new project
    </h2>

    <ProjectForm
      mode="create"
      :form="form"
      :on-submit="submitCreateProject"
      :is-submitting="isSubmitting"
      :on-main-image-change="handleMainImageChange"
      :on-other-images-change="handleOtherImagesChange"
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

const {
  form,
  submitCreateProject,
  isSubmitting,
  handleMainImageChange,
  handleOtherImagesChange,
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
} = useCreateProjectForm();
</script>
