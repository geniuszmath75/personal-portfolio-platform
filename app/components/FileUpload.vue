<template>
  <div class="w-full">
    <!-- Drop zone -->
    <div
      v-if="dropZoneVisible"
      class="relative border-2 border-dashed rounded-lg transition-colors"
      :class="[
        isDragging
          ? 'border-additional-500 bg-additional-500/10'
          : 'border-secondary-500 hover:border-secondary-400',
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ]"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @mouseover.prevent="handleMouseOver"
      @mouseleave.prevent="handleMouseLeave"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        :accept="acceptString"
        :multiple="maxFiles > 1"
        :disabled="isDisabled"
        class="hidden"
        @change="handleFileSelect"
      />

      <div class="p-8 text-center">
        <Icon
          name="mdi:cloud-upload"
          class="text-xl text-secondary-500 mb-4 mx-auto"
        />
        <p class="text-secondary-500 mb-2">
          Upload {{ maxFiles > 1 ? "files" : "a file" }} here, or click to
          select
        </p>
        <p class="text-sm text-secondary-600">
          {{ acceptLabel }} (max {{ maxSizeLabel }})
        </p>
      </div>
    </div>

    <!-- File list -->
    <div v-if="files.length > 0" class="mt-4 space-y-3">
      <div
        v-for="fileItem in files"
        :key="fileItem.id"
        class="flex flex-col gap-4 p-4 bg-primary-600 rounded-lg border border-secondary-500"
      >
        <div class="flex items-center gap-4">
          <!-- Preview -->
          <div
            class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-secondary-500"
          >
            <img
              v-if="fileItem.thumbnailUrl"
              :src="fileItem.thumbnailUrl"
              :alt="fileItem.name"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-primary-500"
            >
              <Icon name="mdi:file" class="text-3xl" />
            </div>
          </div>

          <!-- File info -->
          <div class="flex-1 overflow-hidden">
            <p
              class="text-secondary-500 line-clamp-1 break-all text-sm font-medium"
            >
              {{ fileItem.name }}
            </p>
            <p class="text-secondary-600 text-xs">
              {{ fileItem.file ? formatFileSize(fileItem.file.size) : "" }}
            </p>

            <!-- Progress bar -->
            <div
              v-if="fileItem.status === 'uploading'"
              class="mt-2 w-full bg-primary-700 rounded-full h-2"
            >
              <div
                class="bg-additional-500 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${fileItem.percentage}%` }"
              />
            </div>

            <!-- Finished -->
            <div
              v-else-if="fileItem.status === 'finished'"
              class="mt-2 flex items-center gap-1"
            >
              <Icon name="mdi:check-circle" class="text-success-800 text-sm" />
              <span class="text-success-500 text-xs">Uploaded</span>
            </div>

            <!-- Error -->
            <div
              v-else-if="fileItem.status === 'error'"
              class="mt-2 flex items-center gap-1"
            >
              <Icon name="mdi:alert-circle" class="text-error-500 text-sm" />
              <span class="text-error-500 text-xs">{{
                fileItem.errorMessage
              }}</span>
            </div>

            <!-- Pending (no action/customRequest configured) -->
            <div
              v-else-if="fileItem.status === 'pending'"
              class="mt-2 flex items-center gap-1"
            >
              <Icon
                name="mdi:clock-outline"
                class="text-secondary-500 text-sm"
              />
              <span class="text-secondary-500 text-xs">Ready</span>
            </div>
          </div>

          <!-- Remove button -->
          <button
            v-if="!disabled && fileItem.status !== 'uploading'"
            type="button"
            class="flex p-2 text-secondary-500 hover:text-additional-500 transition-colors"
            @click="removeFile(fileItem.id)"
          >
            <Icon name="mdi:close" class="text-2xl" />
          </button>
        </div>

        <input
          v-if="withAltText && fileItem.file?.type.startsWith('image/')"
          v-model="fileItem.altText"
          type="text"
          placeholder="Image description (alt text)"
          class="mt-2 w-full px-2 py-3 bg-primary-700 border border-secondary-700 rounded text-secondary-500 text-xs placeholder-secondary-700 focus:outline-none focus:border-secondary-300"
          @input="emit('change', files)"
          @click.stop
          @keydown.stop
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { FileUploadEmit, FileUploadProps } from "~/types/components";

const props = withDefaults(defineProps<FileUploadProps>(), {
  fileList: undefined,
  action: undefined,
  customRequest: undefined,
  accept: () => [],
  maxFiles: 1,
  maxSizeMB: 5,
  disabled: false,
  data: () => ({}),
  headers: () => ({}),
  withCredentials: false,
});

const emit = defineEmits<FileUploadEmit>();

const {
  files,
  isDisabled,
  acceptLabel,
  acceptString,
  maxSizeLabel,
  dropZoneVisible,
  formatFileSize,
  processFiles,
  removeFile,
  retry,
  clear,
  getFinishedFiles,
} = useFileUpload(props, {
  onUpdateFileList: (files) => emit("update:fileList", files),
  onChange: (files) => emit("change", files),
  onFinish: (file) => emit("finish", file),
  onError: (file) => emit("error", file),
  onRemove: (file) => emit("remove", file),
});

/**
 * Whether the user is currently dragging files over the drop zone
 */
const isDragging = ref(false);

/**
 * Hidden native file input element
 */
const fileInputRef = ref<HTMLInputElement | null>(null);

/****************
 * EVENT HANDLERS
 ***************/

/**
 * Handles the native file input change event
 *
 * @param event - input event
 */
const handleFileSelect = (event: Event) => {
  if (event.target instanceof HTMLInputElement) {
    processFiles(event.target.files);
  }
  // Reset input so the same file can be re-selected after removal
  if (fileInputRef.value) fileInputRef.value.value = "";
};

/**
 * Sets dragging state when a dragged item enters the drop zone
 */
const handleDragOver = () => {
  if (!isDisabled.value) {
    isDragging.value = true;
  }
};

/**
 * Clears dragging state when a dragged item leaves the drop zone
 */
const handleDragLeave = () => {
  isDragging.value = false;
};

/**
 * Clears dragging state and processes dropped files
 */
const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  processFiles(event.dataTransfer?.files ?? null);
};

/**
 * Triggers the hidden file input programmatically on drop zone click
 */
const triggerFileInput = () => {
  if (!isDisabled.value) {
    fileInputRef.value?.click();
  }
};

/**
 * Sets dragging state when a mouse enters the drop zone
 */
const handleMouseOver = () => {
  isDragging.value = true;
};

/**
 * Clears dragging state when mouse leaves the drop zone
 */
const handleMouseLeave = () => {
  isDragging.value = false;
};

defineExpose({
  retry,
  clear,
  getFinishedFiles,
});
</script>
