<template>
  <div class="bg-primary-500 min-h-screen py-20 px-8">
    <h2
      class="text-2xl md:text-4xl font-bold text-secondary-500 text-center my-12"
    >
      {{ pageTitle }}
    </h2>

    <SectionFormStepper :step="step" />

    <Transition
      mode="out-in"
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <SectionMetadataForm
        v-if="step === 1"
        key="metadata-step"
        v-model:metadata="metadata"
        :placement="placement"
        :type-options="typeOptions"
        :show-duplicate-type-warning="showDuplicateTypeWarning"
        :title-errors="titleErrors"
        :slug-errors="slugErrors"
        :order-errors="orderErrors"
        :is-title-invalid="isTitleInvalid"
        :is-slug-invalid="isSlugInvalid"
        :is-order-invalid="isOrderInvalid"
        :touch-field="touchField"
        :on-order-input="markOrderAsEdited"
      />

      <SectionBlockBuilder
        v-else
        key="blocks-step"
        v-model:blocks="blocks"
        :metadata="metadata"
      />
    </Transition>

    <div class="max-w-5xl mx-auto flex justify-center mt-10 gap-4">
      <Transition
        mode="out-in"
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div
          v-if="step === 2"
          key="submit-actions"
          class="w-full flex flex-wrap md:flex-nowrap justify-center gap-4"
        >
          <BaseBtn
            type="button"
            label="Back"
            btn-style="secondary"
            :is-disabled="isSubmitting"
            @click="goToMetadataStep"
          />
          <BaseBtn
            type="button"
            label="Update section"
            :is-loading="isSubmitting"
            :is-disabled="!hasMinimumBlocks || editorOpen"
            @click="submitUpdateSection"
          />
        </div>

        <BaseBtn
          v-else
          key="continue-button"
          type="button"
          label="Continue to blocks"
          @click="continueToBlockBuilder"
        />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["02-admin"],
});

const {
  step,
  placement,
  metadata,
  blocks,
  typeOptions,
  showDuplicateTypeWarning,
  continueToBlockBuilder,
  goToMetadataStep,
  submitUpdateSection,
  touchField,
  markOrderAsEdited,
  titleErrors,
  slugErrors,
  orderErrors,
  isTitleInvalid,
  isSlugInvalid,
  isOrderInvalid,
  hasMinimumBlocks,
  editorOpen,
  isSubmitting,
} = useSectionForm({ mode: "edit" });

const pageTitle = computed(() =>
  placement.value === "home" ? "Edit home section" : "Edit page",
);
</script>
