<template>
  <form class="max-w-3xl mx-auto space-y-8" @submit.prevent>
    <section class="space-y-6">
      <h3
        class="text-lg font-semibold text-secondary-600 uppercase tracking-wider border-b border-primary-400 pb-2"
      >
        Section metadata
      </h3>

      <p class="text-sm text-secondary-700">
        {{
          placement === "home"
            ? "This section will appear on the home page."
            : "This section will be a standalone page at /{slug}."
        }}
      </p>

      <div
        v-if="showDuplicateTypeWarning"
        class="flex gap-2 rounded-lg border border-warning-500 bg-warning-300/20 px-4 py-3"
        role="status"
      >
        <Icon
          name="mdi:alert"
          class="text-xl text-warning-500 shrink-0"
          aria-hidden="true"
        />
        <p class="text-sm text-secondary-500">
          A section of this type already exists on the home page. You can still
          continue — duplicate types may be grouped later.
        </p>
      </div>

      <div>
        <label class="block text-sm font-bold text-secondary-500 mb-2">
          Title
          <span class="text-secondary-700 font-normal ml-1">(optional)</span>
        </label>
        <FormError :errors="titleErrors">
          <BaseInput
            id="section-title"
            v-model="metadata.title"
            :is-disabled="isSubmitting"
            :is-valid="!isTitleInvalid"
            name="title"
            placeholder="About our team"
            @input="touchField('title')"
          />
        </FormError>
        <p class="text-right text-xs text-secondary-700 mt-1">
          {{ metadata.title.length }} / 64
        </p>
      </div>

      <div>
        <label class="block text-sm font-bold text-secondary-500 mb-2">
          Slug
          <span class="text-secondary-700 font-normal ml-1"
            >(URL path segment, 2–50 characters)</span
          >
        </label>
        <FormError :errors="slugErrors">
          <BaseInput
            id="section-slug"
            v-model="metadata.slug"
            :is-disabled="isSubmitting"
            :is-valid="!isSlugInvalid"
            name="slug"
            placeholder="about-our-team"
            @input="touchField('slug')"
          />
          <p class="text-xs text-secondary-700 mt-1"></p>
        </FormError>
        <p class="text-right text-xs text-secondary-700 mt-1">
          {{ metadata.slug.length }} / 50
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-bold text-secondary-500 mb-2">
            Type
          </label>
          <BaseSelect
            id="section-type"
            v-model="metadata.type"
            name="type"
            :disabled="isSubmitting"
          >
            <BaseOption
              v-for="option in typeOptions"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </BaseSelect>
        </div>

        <div>
          <label class="block text-sm font-bold text-secondary-500 mb-2">
            Order
          </label>
          <FormError :errors="orderErrors">
            <BaseInput
              id="section-order"
              v-model="orderInput"
              type="number"
              min="1"
              :is-disabled="isSubmitting"
              :is-valid="!isOrderInvalid"
              name="order"
              placeholder="1"
              @input="handleOrderInput"
            />
          </FormError>
          <p class="text-xs text-secondary-700 mt-1">
            Display order among sections (positive integer).
          </p>
        </div>
      </div>
    </section>
  </form>
</template>

<script setup lang="ts">
import type {
  SectionMetadataFormProps,
  SectionMetadataFormState,
} from "~/types/sectionForm";

const metadata = defineModel<SectionMetadataFormState>("metadata", {
  required: true,
});

const props = defineProps<SectionMetadataFormProps>();

const orderInput = computed({
  get: () => String(metadata.value.order),
  set: (value: string) => {
    const parsed = Number(value);

    if (value === "" || Number.isNaN(parsed)) {
      metadata.value.order = 0;
      return;
    }

    metadata.value.order = parsed;
  },
});

const handleOrderInput = () => {
  props.onOrderInput();
  props.touchField("order");
};
</script>
