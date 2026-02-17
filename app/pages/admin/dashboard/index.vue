<template>
  <DashboardPanel>
    <DashboardPanelHeader title="PROFILE" />

    <!-- Profile Card -->
    <DashboardPanelSection>
      <template #default>
        <!-- Profile Info -->
        <div
          v-if="!loading"
          class="flex flex-col lg:flex-row flex-1 gap-6 lg:gap-10"
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
          <div class="flex flex-col items-center lg:items-start">
            <h3 class="text-lg md:text-xl text-secondary-500 mb-2">Avatar</h3>
            <div class="p-0.5 bg-secondary-500 rounded-full">
              <img
                v-if="editedData.avatar"
                :src="editedData.avatar"
                alt="User avatar"
                class="h-32 w-32 min-h-32 min-w-32 object-cover rounded-full"
              />
              <Icon v-else name="mdi:user" class="text-primary-500 text-8xl" />
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
        <div v-else class="flex flex-col lg:flex-row w-full gap-2">
          <BaseBtn
            label="CANCEL"
            btn-style="secondary"
            :is-disabled="loading"
            @click="cancelEditing"
          />
          <BaseBtn
            label="SAVE"
            :is-disabled="loading || !hasChanges"
            @click="saveChanges"
          />
        </div>
      </template>
    </DashboardPanelSection>
  </DashboardPanel>
</template>
<script setup lang="ts">
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
} = useAdminProfileForm();

const isEditing = ref(false);

const startEditing = () => {
  isEditing.value = true;
};

const cancelEditing = () => {
  resetToOriginal();
  isEditing.value = false;
};

const saveChanges = async () => {
  const isValid = await validate();
  if (!isValid) {
    showErrorToast("Please correct the form errors");
    return;
  }

  const success = await adminStore.updateAdminProfile({
    email: editedData.value.email,
    username: editedData.value.username,
  });

  if (success) {
    showSuccessToast("Profile updated successfully");
    isEditing.value = false;
  } else {
    cancelEditing();
  }
};

await callOnce("adminProfile", () => adminStore.fetchAdminProfile());

onMounted(() => {
  initFormData(basicAdminDetails.value);
});
</script>
