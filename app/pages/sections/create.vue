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

      <section
        v-else
        key="blocks-step"
        class="max-w-3xl mx-auto space-y-6 text-center"
        aria-label="Block builder"
      >
        <p class="text-secondary-500">
          Block builder will be available in the next step of implementation.
        </p>
        <p class="text-sm text-secondary-700">
          Metadata saved: <strong>{{ metadata.slug }}</strong> ({{
            metadata.type
          }}, order {{ metadata.order }})
        </p>
      </section>
    </Transition>

    <div class="max-w-3xl mx-auto flex justify-center mt-10 gap-4">
      <Transition
        mode="out-in"
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <BaseBtn
          v-if="step === 2"
          key="back-button"
          type="button"
          label="Back"
          btn-style="secondary"
          @click="goToMetadataStep"
        />

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
  typeOptions,
  showDuplicateTypeWarning,
  continueToBlockBuilder,
  goToMetadataStep,
  touchField,
  markOrderAsEdited,
  titleErrors,
  slugErrors,
  orderErrors,
  isTitleInvalid,
  isSlugInvalid,
  isOrderInvalid,
} = useSectionForm();

const pageTitle = computed(() =>
  placement.value === "home" ? "Create home section" : "Create new page",
);
</script>
