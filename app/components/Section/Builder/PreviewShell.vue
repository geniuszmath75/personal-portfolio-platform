<template>
  <div
    class="rounded-xl border border-secondary-700 overflow-hidden bg-primary-600"
  >
    <div
      class="border-b border-secondary-700 px-4 py-2 text-sm text-secondary-700"
    >
      Live preview
    </div>

    <section
      :class="[
        'flex items-center py-12 w-full',
        getSectionBackgroundClass(previewSection.order),
      ]"
    >
      <SectionLayoutHero
        v-if="previewSection.type === ISectionType.HERO"
        :section="previewSection"
      />
      <SectionLayoutSkills
        v-else-if="previewSection.type === ISectionType.SKILLS"
        :section="previewSection"
      />
      <SectionLayoutContact
        v-else-if="previewSection.type === ISectionType.CONTACT"
        :section="previewSection"
      />
      <SectionLayoutAboutMe
        v-else-if="previewSection.type === ISectionType.ABOUT_ME"
        :section="previewSection"
      />
      <SectionLayoutFallback v-else :section="previewSection" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ISectionType } from "~~/shared/types/enums";
import type { SectionBuilderPreviewShellProps } from "~/types/sectionForm";

const props = defineProps<SectionBuilderPreviewShellProps>();

const previewSection = computed<ValidatedSection>(() => ({
  _id: "preview",
  title: props.metadata.title || null,
  slug: props.metadata.slug || "preview",
  type: props.metadata.type,
  order: props.metadata.order,
  blocks: props.blocks,
}));
</script>
