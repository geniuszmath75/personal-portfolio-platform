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
            <DashboardFormField label="Username">
              <BaseInput
                id="username"
                name="username"
                :is-disabled="!isEditing"
                :model-value="editedData.username"
              />
            </DashboardFormField>
            <DashboardFormField label="Email">
              <BaseInput
                id="email"
                name="email"
                :is-disabled="!isEditing"
                :model-value="editedData.email"
              />
            </DashboardFormField>
          </div>

          <!-- Avatar -->
          <div class="flex flex-col items-center lg:items-start">
            <h3 class="text-lg md:text-xl text-secondary-500 mb-2">Avatar</h3>
            <div class="p-0.5 bg-secondary-500 rounded-full">
              <img
                v-if="editedData.avatar"
                :src="editedData.avatar"
                alt="User avatar"
                class="h-32 w-32 object-cover rounded-full"
              />
              <Icon v-else name="mdi:user" class="text-primary-500 text-8xl" />
            </div>
          </div>
        </div>
        <LoadingAnimation v-else label="Loading admin details..." />
      </template>

      <template #actions>
        <!-- Edit button -->
        <BaseBtn v-if="!loading" label="EDIT" @click="handleEditBtn" />
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

const editedData = ref({
  email: "",
  username: "",
  avatar: null as string | null,
});

const originalData = ref({
  email: "",
  username: "",
  avatar: null as string | null,
});
const isEditing = ref(false);

const handleEditBtn = () => {
  showWarningToast("EDIT btn clicked");
};

await callOnce("adminProfile", () => adminStore.fetchAdminProfile());

onMounted(async () => {
  editedData.value = { ...basicAdminDetails.value };
  originalData.value = { ...basicAdminDetails.value };
});
</script>
