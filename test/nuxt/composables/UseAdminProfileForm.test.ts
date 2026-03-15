import { describe, it, expect } from "vitest";
import { useAdminProfileForm } from "../../../app/composables/useAdminProfileForm";
import { mount } from "vue-composable-tester";

const VALID_DATA = {
  email: "admin@example.com",
  username: "admin_user",
  avatar: null as string | null,
};

describe("useAdminProfileForm composable", () => {
  it("should return expected API shape", () => {
    // Arrange
    const { result } = mount(() => useAdminProfileForm());

    // Assert
    expect(result).toHaveProperty("editedData");

    expect(result).toHaveProperty("validate");
    expect(result).toHaveProperty("touchFields");

    expect(result).toHaveProperty("usernameErrors");
    expect(result).toHaveProperty("emailErrors");
    expect(result).toHaveProperty("isEmailInvalid");
    expect(result).toHaveProperty("isUsernameInvalid");

    expect(result).toHaveProperty("hasChanges");
    expect(result).toHaveProperty("initFormData");
    expect(result).toHaveProperty("resetToOriginal");
    expect(result).toHaveProperty("pendingAvatarFile");
    expect(result).toHaveProperty("isAvatarInvalid");
    expect(result).toHaveProperty("getChangedFields");
  });

  it("should initialize with empty fields, null avatar and no pending file", () => {
    const { result } = mount(() => useAdminProfileForm());

    expect(result.editedData.value).toEqual({
      email: "",
      username: "",
      avatar: null,
    });
    expect(result.pendingAvatarFile.value).toBeNull();
    expect(result.isAvatarInvalid.value).toBe(false);
    expect(result.hasChanges.value).toBe(false);
  });

  it("should 'initFormData' populates editedData and resets pendingAvatarFile", () => {
    const { result } = mount(() => useAdminProfileForm());

    result.pendingAvatarFile.value = new File([""], "old.png");
    result.initFormData(VALID_DATA);

    expect(result.editedData.value).toEqual(VALID_DATA);
    expect(result.pendingAvatarFile.value).toBeNull();
    expect(result.hasChanges.value).toBe(false);
  });

  it("should 'resetToOriginal' restores all fields and clears pendingAvatarFile", () => {
    const { result } = mount(() => useAdminProfileForm());

    result.initFormData(VALID_DATA);
    result.editedData.value.username = "changed";
    result.pendingAvatarFile.value = new File([""], "new.png");

    result.resetToOriginal();

    expect(result.editedData.value).toEqual(VALID_DATA);
    expect(result.pendingAvatarFile.value).toBeNull();
    expect(result.hasChanges.value).toBe(false);
  });

  it("should 'hasChanges' be true when any field differs from the original", () => {
    const { result } = mount(() => useAdminProfileForm());

    result.initFormData(VALID_DATA);

    result.editedData.value.username = "new_name";
    expect(result.hasChanges.value).toBe(true);

    result.resetToOriginal();
    result.editedData.value.email = "other@example.com";
    expect(result.hasChanges.value).toBe(true);

    result.resetToOriginal();
    result.pendingAvatarFile.value = new File([""], "avatar.png");
    expect(result.hasChanges.value).toBe(true);
  });

  it("should 'getChangedFields' returns only modified fields", () => {
    const { result } = mount(() => useAdminProfileForm());

    result.initFormData(VALID_DATA);
    result.editedData.value.username = "new_admin";
    result.editedData.value.email = "new@example.com";

    expect(result.getChangedFields()).toEqual({
      username: "new_admin",
      email: "new@example.com",
    });
  });

  it("should 'getChangedFields' returns empty object when nothing changed", () => {
    const { result } = mount(() => useAdminProfileForm());

    result.initFormData(VALID_DATA);

    expect(result.getChangedFields()).toEqual({});
  });

  it("should 'getChangedFields' returns avatar as undefined when cleared to null", () => {
    const { result } = mount(() => useAdminProfileForm());

    result.initFormData({
      ...VALID_DATA,
      avatar: "https://cdn.example.com/old.png",
    });
    result.editedData.value.avatar = null;

    expect(result.getChangedFields()).toEqual({ avatar: undefined });
  });

  it("should 'validate' returns true for valid data", async () => {
    const { result } = mount(() => useAdminProfileForm());

    result.initFormData(VALID_DATA);

    expect(await result.validate()).toBe(true);
  });

  it("should 'validate' returns false and exposes errors for empty fields", async () => {
    const { result } = mount(() => useAdminProfileForm());

    expect(await result.validate()).toBe(false);
    expect(result.isEmailInvalid.value).toBe(true);
    expect(result.isUsernameInvalid.value).toBe(true);
    expect(result.emailErrors.value.length).toBeGreaterThan(0);
    expect(result.usernameErrors.value.length).toBeGreaterThan(0);
  });

  it("should 'validate' returns false for an invalid email format", async () => {
    const { result } = mount(() => useAdminProfileForm());

    result.initFormData({ ...VALID_DATA, email: "not-an-email" });

    expect(await result.validate()).toBe(false);
    expect(result.isEmailInvalid.value).toBe(true);
  });

  it("should 'touchFields' marks only the specified field as invalid", () => {
    const { result } = mount(() => useAdminProfileForm());

    result.touchFields("email");

    expect(result.isEmailInvalid.value).toBe(true);
    expect(result.isUsernameInvalid.value).toBe(false);
  });
});
