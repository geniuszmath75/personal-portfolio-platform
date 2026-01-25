<template>
  <div class="px-6 py-8">
    <!-- Tabs - visble only on small screens -->
    <div class="mb-8 md:hidden">
      <div class="flex border-b border-primary-400">
        <BaseBtn
          type="button"
          label="Login"
          btn-style="tab--active"
          btn-size="tab"
        />
      </div>
    </div>

    <!-- Title - hidden on small screens -->
    <div class="mb-8 hidden md:block">
      <h2 class="text-2xl md:text-4xl font-bold text-center text-secondary-500">
        Login
      </h2>
    </div>

    <!-- Login form -->
    <form class="space-y-6" @submit.prevent="submitLogin">
      <!-- Email field -->
      <div>
        <label for="email" class="text-sm font-bold text-secondary-500 mb-2"
          >Email:</label
        >
        <FormError :errors="emailErrors">
          <BaseInput
            id="email"
            ref="emailInput"
            v-model="formCredentials.email"
            :is-disabled="loading"
            name="email"
            placeholder="example@gmail.com"
            :is-valid="!isEmailInvalid"
            @input="touchFields('email')"
          />
        </FormError>
      </div>

      <!-- Password field -->
      <div>
        <label for="password" class="text-sm font-bold text-secondary-500 mb-2"
          >Password:</label
        >
        <FormError :errors="passwordErrors">
          <div class="relative">
            <BaseInput
              id="password"
              v-model="formCredentials.password"
              :is-disabled="loading"
              :type="isPasswordVisible ? 'text' : 'password'"
              name="password"
              placeholder="********"
              :is-valid="!isPasswordInvalid"
              @input="touchFields('password')"
            />

            <!-- Show / Hide password icon -->
            <div
              class="absolute my-2 inset-y-0 right-3 flex justify-center items-center text-secondary-500 hover:bg-primary-400 rounded-full cursor-pointer p-2"
              @click="toggleVisibility"
            >
              <Icon
                v-if="!isPasswordVisible"
                name="mdi:eye-off-outline"
                class="text-xl"
              />
              <Icon v-else name="mdi:eye-outline" class="text-xl" />
            </div>
          </div>
        </FormError>
      </div>

      <!-- Submit button -->
      <BaseBtn label="Log In" :is-disabled="loading" />
    </form>
  </div>
</template>
<script setup lang="ts">
import BaseInput from "~/components/BaseInput.vue";
import { useLoginForm } from "~/composables/useLoginForm";

definePageMeta({
  layout: "auth",
  middleware: ["03-guest"],
});

const authStore = useAuthStore();
const { loading } = storeToRefs(authStore);
const { isPasswordVisible, toggleVisibility } = usePasswordVisibility();
const {
  submitLogin,
  formCredentials,
  touchFields,
  emailErrors,
  passwordErrors,
  isEmailInvalid,
  isPasswordInvalid,
} = useLoginForm({ email: "", password: "" });

// BaseInput instance type
type BaseInputInstance = InstanceType<typeof BaseInput>;

// Email input reference
const emailRef = useTemplateRef<BaseInputInstance>("emailInput");

// Focus on email input on component mount/
onMounted(() => {
  emailRef.value?.$el.focus();
});
</script>
