<template>
  <div class="bg-primary-500 min-h-screen py-20 px16">
    <h2
      class="text-2xl md:text-4xl font-bold text-secondary-500 text-center my-12"
    >
      Create new project
    </h2>

    <form
      class="max-w-3xl mx-auto space-y-10"
      @submit.prevent="submitCreateProject"
    >
      <!-- BASIC INFO -->
      <section class="space-y-6">
        <h3
          class="text-lg font-semibold text-secondary-600 uppercase tracking-wider border-b border-primary-400 pb-2"
        >
          Basic Info
        </h3>

        <!-- Title -->
        <div>
          <label class="block text-sm font-bold text-secondary-500 mb-2">
            Title
          </label>
          <FormError :errors="titleErrors">
            <BaseInput
              id="title"
              v-model="form.title"
              :is-disabled="isSubmitting"
              :is-valid="!isTitleInvalid"
              name="title"
              placeholder="My awesome project"
              @input="touchField('title')"
            />
          </FormError>
        </div>

        <!-- Short Description -->
        <div>
          <label class="block text-sm font-bold text-secondary-500 mb-2">
            Short Description
            <span class="text-secondary-700 font-normal ml-1"
              >(shown on project card, max 64 characters)</span
            >
          </label>
          <FormError :errors="shortDescriptionErrors">
            <BaseInput
              id="shortDescription"
              v-model="form.shortDescription"
              :is-disabled="isSubmitting"
              :is-valid="!isShortDescriptionInvalid"
              name="shortDescription"
              placeholder="A brief summary of the project"
              @input="touchField('shortDescription')"
            />
          </FormError>
          <p class="text-right text-xs text-secondary-700 mt-1">
            {{ form.shortDescription.length }} / 64
          </p>
        </div>

        <!-- Long Description -->
        <div>
          <label class="block text-sm font-bold text-secondary-500 mb-2">
            Long Description
            <span class="text-secondary-700 font-normal ml-1"
              >(project detail page, 64-1024 characters)</span
            >
          </label>
          <FormError :errors="longDescriptionErrors">
            <textarea
              id="longDescription"
              v-model="form.longDescription"
              :disabled="isSubmitting"
              :class="[
                'w-full px-4 py-3 bg-primary-600 border-2 rounded-lg text-secondary-500',
                'placeholder-secondary-700 focus:outline-none transition-all resize-none',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isLongDescriptionInvalid
                  ? 'border-additional-500 focus:border-additional-500'
                  : 'border-secondary-700 focus:border-secondary-300',
              ]"
              rows="6"
              placeholder="Detailed description of the project, its goals, implementation details..."
              @input="touchField('longDescription')"
            />
          </FormError>
          <p class="text-right text-xs text-secondary-700 mt-1">
            {{ form.longDescription.length }} / 1024
          </p>
        </div>

        <!-- Status + Source (side by side) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Status -->
          <div>
            <label class="block text-sm font-bold text-secondary-500 mb-2">
              Status
            </label>
            <select
              id="status"
              v-model="form.status"
              :disabled="isSubmitting"
              class="w-full px-4 py-3 bg-primary-600 border-2 border-secondary-700 rounded-lg text-secondary-500 focus:outline-none focus:border-secondary-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option
                v-for="status in ProjectStatusType"
                :key="status"
                :value="status"
              >
                {{ status }}
              </option>
            </select>
          </div>

          <!-- Project Source -->
          <div>
            <label class="block text-sm font-bold text-secondary-500 mb-2">
              Project Source
            </label>
            <select
              id="projectSource"
              v-model="form.projectSource"
              :disabled="isSubmitting"
              class="w-full px-4 py-3 bg-primary-600 border-2 border-secondary-700 rounded-lg text-secondary-500 focus:outline-none focus:border-secondary-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option
                v-for="source in ProjectSourceType"
                :key="source"
                :value="source"
              >
                {{ source }}
              </option>
            </select>
          </div>
        </div>
      </section>

      <!-- DATES -->
      <section class="space-y-6">
        <h3
          class="text-lg font-semibold text-secondary-600 uppercase tracking-wider border-b border-primary-400 pb-2"
        >
          Dates
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Start Date -->
          <div>
            <label class="block text-sm font-bold text-secondary-500 mb-2">
              Start date
            </label>
            <FormError :errors="startDateErrors">
              <BaseInput
                id="startDate"
                v-model="form.startDate"
                :is-disabled="isSubmitting"
                :is-valid="!isStartDateInvalid"
                type="date"
                name="startDate"
                @change="touchField('startDate')"
              />
            </FormError>
          </div>

          <!-- End Date -->
          <div>
            <label class="block text-sm font-bold text-secondary-500 mb-2">
              End date
              <span class="text-secondary-700 font-normal ml-1"
                >(optional)</span
              >
            </label>
            <BaseInput
              id="endDate"
              v-model="form.endDate"
              :is-disabled="isSubmitting"
              type="date"
              name="endDate"
            />
          </div>
        </div>
      </section>

      <!-- TECHNOLOGIES -->
      <section class="space-y-4">
        <h3
          class="text-lg font-semibold text-secondary-600 uppercase tracking-wider border-b border-primary-400 pb-2"
        >
          Technologies
        </h3>

        <!-- Input row -->
        <div class="flex gap-3">
          <div class="flex-1">
            <BaseInput
              id="techInput"
              v-model="techInput"
              :is-disabled="isSubmitting"
              name="techInput"
              placeholder="e.g. Vue, Node.js, MongoDB"
              @keydown.enter.prevent="addTechnology"
            />
          </div>
          <BaseBtn
            label="Add"
            btn-size="small"
            :is-disabled="isSubmitting || !techInput.trim()"
            class="!w-auto px-6 shrink-0"
            @click="addTechnology"
          />
        </div>

        <!-- Error -->
        <p
          v-if="technologiesErrors"
          class="flex gap-2 text-secondary-500 font-semibold"
        >
          <Icon
            name="material-symbols:error-outline"
            class="text-2xl text-additional-500"
          />
          {{ technologiesErrors }}
        </p>

        <!-- Tag list -->
        <div v-if="form.technologies.length" class="flex flex-wrap gap-2">
          <BaseTag
            v-for="(tech, i) in form.technologies"
            :key="tech"
            type="primary"
            class="relative"
          >
            {{ tech }}
            <button
              type="button"
              class="absolute -top-2 -right-2 flex text-primary-500 p-1 bg-additional-500 transition-colors rounded-full"
              @click="removeTechnology(i)"
            >
              <Icon name="mdi:close" class="text-base" />
            </button>
          </BaseTag>
        </div>
        <p v-else class="text-secondary-700 text-sm italic">
          No technologies added yet.
        </p>
      </section>

      <!-- GAINED EXPERIENCE -->
      <section class="space-y-4">
        <h3
          class="text-lg font-semibold text-secondary-600 uppercase tracking-wider border-b border-primary-400 pb-2"
        >
          Gained Experience
        </h3>

        <!-- Input row -->
        <div class="flex gap-3">
          <div class="flex-1">
            <BaseInput
              id="experienceInput"
              v-model="experienceInput"
              :is-disabled="isSubmitting"
              name="experienceInput"
              placeholder="e.g. Learned how to design REST APIs"
              @keydown.enter.prevent="addExperience"
            />
          </div>
          <BaseBtn
            type="button"
            label="Add"
            btn-size="small"
            :is-disabled="isSubmitting || !experienceInput.trim()"
            class="!w-auto px-6 shrink-0"
            @click="addExperience"
          />
        </div>

        <!-- Error -->
        <p
          v-if="gainedExperienceErrors"
          class="flex gap-2 text-secondary-500 font-semibold"
        >
          <Icon
            name="material-symbols:error-outline"
            class="text-2xl text-additional-500"
          />
          {{ gainedExperienceErrors }}
        </p>

        <!-- Experience list -->
        <ul v-if="form.gainedExperience.length" class="space-y-2">
          <li
            v-for="(exp, i) in form.gainedExperience"
            :key="i"
            class="flex items-start gap-3 p-3 bg-primary-600 border border-secondary-700 rounded-lg"
          >
            <p class="flex-1 text-secondary-500 text-sm">
              {{ exp }}
            </p>
            <button
              type="button"
              class="relative flex justify-center items-center text-secondary-500 hover:text-additional-500 transition-colors shrink-0"
              @click="removeExperience(i)"
            >
              <Icon name="mdi:close" class="text-xl" />
            </button>
          </li>
        </ul>
        <p v-else class="text-secondary-700 text-sm italic">
          No experience entries added yet.
        </p>
      </section>

      <!-- LINKS -->
      <section class="space-y-6">
        <h3
          class="text-lg font-semibold text-secondary-600 uppercase tracking-wider border-b border-primary-400 pb-2"
        >
          Links
          <span class="text-secondary-700 font-normal ml-1 normal-case"
            >(optional)</span
          >
        </h3>

        <!-- GitHub -->
        <div>
          <label class="block text-sm font-bold text-secondary-500 mb-2"
            >GitHub repository</label
          >
          <FormError :errors="githubLinkErrors">
            <BaseInput
              id="githubLink"
              v-model="form.githubLink"
              :is-disabled="isSubmitting"
              :is-valid="!isGithubLinkInvalid"
              name="githubLink"
              placeholder="https://github.com/username/repo"
              @input="touchField('githubLink')"
            />
          </FormError>
        </div>

        <!-- Website -->
        <div>
          <label class="block text-sm font-bold text-secondary-500 mb-2"
            >Live website</label
          >
          <FormError :errors="websiteLinkErrors">
            <BaseInput
              id="websiteLink"
              v-model="form.websiteLink"
              :is-disabled="isSubmitting"
              :is-valid="!isWebsiteLinkInvalid"
              name="websiteLink"
              placeholder="https://my-project.com"
              @input="touchField('websiteLink')"
            />
          </FormError>
        </div>
      </section>

      <!-- IMAGES -->
      <section class="space-y-6">
        <h3
          class="text-lg font-semibold text-secondary-600 uppercase tracking-wider border-b border-primary-400 pb-2"
        >
          Images
        </h3>

        <!-- Main image -->
        <div>
          <label class="block text-sm font-bold text-secondary-500 mb-2"
            >Main image
            <span class="text-secondary-700 font-normal ml-1 normal-case"
              >(required, displayed on project card)</span
            ></label
          >
          <FileUpload
            :max-files="1"
            :accept="['image/jpeg', 'image/png', 'image/webp']"
            :max-size-m-b="5"
            :disabled="isSubmitting"
          />
          <div class="mt-3">
            <label class="block text-sm font-bold text-secondary-500 mb-2">
              Alt text
              <span class="text-secondary-700 font-normal ml-1">
                (required, description for accessibility)
              </span>
            </label>
          </div>
        </div>

        <!-- Other images -->
        <div>
          <label class="block text-sm font-bold text-secondary-500 mb-2"
            >Additional images
            <span class="text-secondary-700 font-normal ml-1">(optional)</span>
          </label>
          <FileUpload
            :max-files="10"
            :accept="['image/jpeg', 'image/png', 'image/webp']"
            :max-size-m-b="5"
            :disabled="isSubmitting"
          />
        </div>
      </section>

      <!-- SUBMIT -->
      <div class="pt-4 pb-12">
        <BaseBtn
          label="Create project"
          :is-disabled="isSubmitting"
          :is-loading="isSubmitting"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["02-admin"],
});

const {
  form,
  techInput,
  experienceInput,
  addTechnology,
  removeTechnology,
  addExperience,
  removeExperience,
  submitCreateProject,
  touchField,
  isSubmitting,
  titleErrors,
  shortDescriptionErrors,
  longDescriptionErrors,
  startDateErrors,
  technologiesErrors,
  gainedExperienceErrors,
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
