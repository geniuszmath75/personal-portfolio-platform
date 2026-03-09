<template>
  <DashboardPanel>
    <DashboardPanelHeader title="PROFILE" />

    <!-- Profile Card -->
    <DashboardPanelSection>
      <template #default>
        <!-- Profile Info -->
        <div
          v-if="!loading"
          class="flex flex-col lg:flex-row flex-wrap flex-1 gap-6 lg:gap-10"
        >
          <!-- Text Fields -->
          <div class="flex flex-col gap-4">
            <FormError :errors="usernameErrors">
              <DashboardFormField label="Username">
                <BaseInput
                  id="username"
                  v-model="editedData.username"
                  name="username"
                  :is-disabled="!isEditing"
                  :is-valid="!isUsernameInvalid"
                  @input="touchFields('username')"
                />
              </DashboardFormField>
            </FormError>

            <FormError :errors="emailErrors">
              <DashboardFormField label="Email">
                <BaseInput
                  id="email"
                  v-model="editedData.email"
                  name="email"
                  :is-disabled="!isEditing"
                  :is-valid="!isEmailInvalid"
                  @input="touchFields('email')"
                />
              </DashboardFormField>
            </FormError>
          </div>

          <!-- Avatar -->
          <div class="flex flex-col items-center justify-center lg:items-start">
            <h3 class="text-lg md:text-xl text-secondary-500 mb-2">Avatar</h3>

            <!-- Current Avatar Display (when not editing) -->
            <div
              v-if="!isEditing"
              class="relative p-0.5 bg-secondary-500 rounded-full"
            >
              <img
                v-if="editedData.avatar"
                :src="editedData.avatar"
                alt="User avatar"
                class="h-32 w-32 min-h-32 min-w-32 object-cover rounded-full"
              />
              <Icon v-else name="mdi:user" class="text-primary-500 text-8xl" />
            </div>

            <!-- Avatar upload (when editing) -->
            <div
              v-else
              class="flex justify-center items-center flex-wrap lg:flex-nowrap gap-3"
            >
              <!-- Current avatar preview -->
              <div class="relative p-0.5 bg-secondary-500 rounded-full group">
                <img
                  v-if="editedData.avatar"
                  :src="editedData.avatar"
                  alt="Avatar preview"
                  class="h-32 w-32 min-h-32 min-w-32 object-cover rounded-full"
                />
                <Icon
                  v-else
                  name="mdi:user"
                  class="text-primary-500 text-8xl"
                />
              </div>

              <!-- File upload -->
              <FileUpload
                ref="fileUploadRef"
                :accept="[
                  'image/jpeg',
                  'image/png',
                  'image/webp',
                  'image/svg+xml',
                ]"
                @change="handleAvatarChange"
              />
            </div>
          </div>
        </div>
        <LoadingAnimation v-else label="Loading admin details..." />
      </template>

      <template #actions>
        <!-- Edit button -->
        <BaseBtn
          v-if="!loading && !isEditing"
          label="EDIT"
          @click="startEditing"
        />
        <div v-else class="flex flex-col xl:flex-row w-full gap-2">
          <BaseBtn
            label="CANCEL"
            btn-style="secondary"
            :is-disabled="loading"
            @click="cancelEditing"
          />
          <BaseBtn
            label="SAVE"
            :is-disabled="loading || !hasChanges"
            :is-loading="loading"
            @click="saveChanges"
          />
        </div>
      </template>
    </DashboardPanelSection>
  </DashboardPanel>
</template>
<script setup lang="ts">
import type FileUpload from "~/components/FileUpload.vue";
import type { UploadFileInfo } from "~/types/components";

definePageMeta({
  layout: "dashboard",
  middleware: ["02-admin"],
});

const adminStore = useAdminStore();
const { loading, basicAdminDetails } = storeToRefs(adminStore);

const {
  editedData,
  validate,
  touchFields,
  usernameErrors,
  emailErrors,
  isEmailInvalid,
  isUsernameInvalid,
  hasChanges,
  resetToOriginal,
  initFormData,
  pendingAvatarFile,
  isAvatarInvalid,
} = useAdminProfileForm();

const isEditing = ref(false);
const fileUploadRef = ref<InstanceType<typeof FileUpload>>();

const startEditing = () => {
  isEditing.value = true;
};

const cancelEditing = () => {
  resetToOriginal();
  fileUploadRef.value?.clear();
  isEditing.value = false;
};

const handleAvatarChange = (files: UploadFileInfo[]) => {
  const avatar = files[0];

  if (!avatar) {
    pendingAvatarFile.value = null;
    isAvatarInvalid.value = false;
    return;
  }
  if (avatar.status === "error") {
    pendingAvatarFile.value = null;
    isAvatarInvalid.value = true;
    return;
  }
  pendingAvatarFile.value = avatar.file;
  isAvatarInvalid.value = false;
};

const saveChanges = async () => {
  // Validate form text inputs
  const areTextInputsValid = await validate();
  if (!areTextInputsValid) {
    showErrorToast("Please correct the form errors");
    return;
  }

  // Validate form file input
  if (isAvatarInvalid.value) {
    showErrorToast("Please fix avatar file before saving");
    return;
  }

  try {
    if (pendingAvatarFile.value) {
      const uploadedUrl = await adminStore.uploadAvatar(
        pendingAvatarFile.value,
        UploadCategory.AVATARS,
      );

      if (!uploadedUrl) {
        showErrorToast("Failed to upload avatar");
        return;
      }

      editedData.value.avatar = uploadedUrl;
    }

    // Update profile with all changes
    const success = await adminStore.updateAdminProfile({
      email: editedData.value.email,
      username: editedData.value.username,
      avatar: editedData.value.avatar ?? undefined,
    });

    if (success) {
      showSuccessToast("Profile updated successfully");
      initFormData(basicAdminDetails.value);
      isEditing.value = false;
      fileUploadRef.value?.clear();
    } else {
      cancelEditing();
    }
  } catch {
    showErrorToast("Failed to update admin profile");
  }
};

await callOnce("adminProfile", () => adminStore.fetchAdminProfile());

onMounted(() => {
  initFormData(basicAdminDetails.value);
});
</script>
