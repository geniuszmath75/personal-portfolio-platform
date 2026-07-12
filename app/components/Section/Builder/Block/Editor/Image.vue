<template>
  <div class="space-y-4">
    <FileUpload
      :file-list="fileList"
      :accept="['image/jpeg', 'image/png', 'image/webp']"
      :max-files="1"
      :max-size-m-b="5"
      :disabled="disabled"
      with-alt-text
      @update:file-list="emit('update:fileList', $event)"
      @change="emit('change', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { UploadFileInfo } from "~/types/components";
import type { SectionBlockEditorImageProps } from "~/types/sectionForm";

defineProps<SectionBlockEditorImageProps>();

const emit = defineEmits<{
  "update:fileList": [files: UploadFileInfo[]];
  change: [files: UploadFileInfo[]];
}>();
</script>
