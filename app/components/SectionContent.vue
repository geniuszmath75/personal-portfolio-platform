<template>
  <section
    :class="[
      'flex items-center py-20 md:min-h-screen w-full',
      section.order % 2 === 0 ? 'bg-secondary-500' : 'bg-primary-500',
    ]"
  >
    <SectionLayoutHero
      v-if="section.type === ISectionType.HERO"
      :section="section"
    />
    <SectionLayoutSkills
      v-else-if="section.type === ISectionType.SKILLS"
      :section="section"
    />
    <SectionLayoutContact
      v-else-if="section.type === ISectionType.CONTACT"
      :section="section"
    />
    <SectionLayoutFallback v-else :section="section" />
  </section>
</template>

<script setup lang="ts">
import type { ValidatedSection } from "~~/app/utils/validateSection";
import { ISectionType } from "~~/shared/types/enums";

defineProps<{
  section: ValidatedSection;
}>();
</script>
