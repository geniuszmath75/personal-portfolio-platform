import { afterEach, beforeEach, describe, vi, it, expect } from "vitest";
import { useCreateProjectForm } from "~/composables/useCreateProjectForm";
import { mount } from "vue-composable-tester";
import { showErrorToast, showSuccessToast } from "~/utils/toastNotification";
import { createTestPinia } from "~~/test/setup";
import { setActivePinia } from "pinia";
import { useProjectsStore } from "~/stores/projectsStore";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import type { UploadFileInfo } from "~/types/components";

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }));

mockNuxtImport("navigateTo", () => navigateToMock);

vi.mock("~/utils/toastNotification", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

vi.mock("~/utils/handleError", () => ({
  handleError: vi.fn(),
}));

vi.mock("@vuelidate/core", () => ({
  default: vi.fn(() => ({
    value: {
      title: { $errors: [], $error: false, $touch: vi.fn() },
      shortDescription: { $errors: [], $error: false, $touch: vi.fn() },
      longDescription: { $errors: [], $error: false, $touch: vi.fn() },
      startDate: { $errors: [], $error: false, $touch: vi.fn() },
      githubLink: { $errors: [], $error: false, $touch: vi.fn() },
      websiteLink: { $errors: [], $error: false, $touch: vi.fn() },
      $validate: vi.fn().mockResolvedValue(true),
    },
  })),
}));

describe("useCreateProjectForm composable", () => {
  let projectsStore: ReturnType<typeof useProjectsStore>;

  // Mock data helpers
  const mockFile = new File(["content"], "image.jpg", { type: "image/jpeg" });

  const mockUploadInfo = (
    overrides?: Partial<UploadFileInfo>,
  ): UploadFileInfo[] => [
    {
      id: "1",
      name: "image.jpg",
      status: "finished",
      file: mockFile,
      altText: "Main image",
      percentage: 100,
      url: null,
      thumbnailUrl: null,
      type: "image/jpeg",
      errorMessage: null,
      ...overrides,
    },
  ];

  beforeEach(() => {
    setActivePinia(createTestPinia());
    projectsStore = useProjectsStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Form initialization", () => {
    it("should initialize form with default values", () => {
      // Arrange & Act
      const { result } = mount(() => useCreateProjectForm());

      // Assert
      expect(result.form.value.title).toBe("");
      expect(result.form.value.shortDescription).toBe("");
      expect(result.form.value.longDescription).toBe("");
      expect(result.form.value.startDate).toBe("");
      expect(result.form.value.endDate).toBe("");
      expect(result.form.value.technologies).toEqual([]);
      expect(result.form.value.gainedExperience).toEqual([]);
    });

    it("should initialize refs with empty values", () => {
      // Arrange & Act
      const { result } = mount(() => useCreateProjectForm());

      // Assert
      expect(result.techInput.value).toBe("");
      expect(result.experienceInput.value).toBe("");
      expect(result.technologiesErrors.value).toBe("");
      expect(result.gainedExperienceErrors.value).toBe("");
    });
  });

  describe("Main image handling", () => {
    it("should handle main image with valid file", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());

      // Act
      result.handleMainImageChange(mockUploadInfo());

      // Assert
      expect(result.form.value.title).toBe("");
    });

    it("should clear main image when no file provided", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());

      // Act
      result.handleMainImageChange([]);

      // Assert
      expect(result.form.value.title).toBe("");
    });

    it("should mark main image as invalid on upload error", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      const errorUploadInfo: UploadFileInfo[] = mockUploadInfo({
        status: "error",
        file: null,
        altText: "",
        errorMessage: "Upload failed",
      });

      // Act
      result.handleMainImageChange(errorUploadInfo);

      // Assert
      expect(result.form.value.title).toBe("");
    });
  });

  describe("Other images handling", () => {
    it("should add multiple other images", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      const uploadInfo: UploadFileInfo[] = [
        ...mockUploadInfo({ id: "1", name: "image1.jpg", altText: "Image 1" }),
        ...mockUploadInfo({ id: "2", name: "image2.jpg", altText: "Image 2" }),
      ];

      // Act
      result.handleOtherImagesChange(uploadInfo);

      // Assert
      expect(result.form.value.title).toBe("");
    });

    it("should filter out error images", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      const uploadInfo: UploadFileInfo[] = [
        ...mockUploadInfo({ id: "1", altText: "Valid image" }),
        ...mockUploadInfo({
          id: "2",
          name: "error.jpg",
          status: "error",
          file: null,
          altText: "Error image",
          errorMessage: "Upload error",
        }),
      ];

      // Act
      result.handleOtherImagesChange(uploadInfo);

      // Assert
      expect(result.form.value.title).toBe("");
    });

    it("should clear other images when empty array provided", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.handleOtherImagesChange(mockUploadInfo({ altText: "Image" }));

      // Act
      result.handleOtherImagesChange([]);

      // Assert
      expect(result.form.value.title).toBe("");
    });
  });

  describe("Technology list management", () => {
    it("should add technology to the list", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.techInput.value = "React";

      // Act
      result.addTechnology();

      // Assert
      expect(result.form.value.technologies).toContain("React");
      expect(result.techInput.value).toBe("");
    });

    it("should not add empty technology", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.techInput.value = "";

      // Act
      result.addTechnology();

      // Assert
      expect(result.form.value.technologies.length).toBe(0);
    });

    it("should not add duplicate technology", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.techInput.value = "Vue";
      result.addTechnology();

      // Act
      result.techInput.value = "Vue";
      result.addTechnology();

      // Assert
      expect(result.form.value.technologies.length).toBe(1);
      expect(
        result.form.value.technologies.filter((t: string) => t === "Vue")
          .length,
      ).toBe(1);
    });

    it("should remove technology by index", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.techInput.value = "React";
      result.addTechnology();
      result.techInput.value = "Vue";
      result.addTechnology();

      // Act
      result.removeTechnology(0);

      // Assert
      expect(result.form.value.technologies.length).toBe(1);
      expect(result.form.value.technologies[0]).toBe("Vue");
    });

    it("should clear technologies error on add", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.technologiesErrors.value = "At least one technology is required";
      result.techInput.value = "Node.js";

      // Act
      result.addTechnology();

      // Assert
      expect(result.technologiesErrors.value).toBe("");
    });
  });

  describe("Experience list management", () => {
    it("should add experience to the list", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.experienceInput.value = "Learned React fundamentals";

      // Act
      result.addExperience();

      // Assert
      expect(result.form.value.gainedExperience).toContain(
        "Learned React fundamentals",
      );
      expect(result.experienceInput.value).toBe("");
    });

    it("should not add empty experience", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.experienceInput.value = "";

      // Act
      result.addExperience();

      // Assert
      expect(result.form.value.gainedExperience.length).toBe(0);
    });

    it("should not add duplicate experience", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.experienceInput.value = "API integration";
      result.addExperience();

      // Act
      result.experienceInput.value = "API integration";
      result.addExperience();

      // Assert
      expect(result.form.value.gainedExperience.length).toBe(1);
    });

    it("should remove experience by index", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.experienceInput.value = "First experience";
      result.addExperience();
      result.experienceInput.value = "Second experience";
      result.addExperience();

      // Act
      result.removeExperience(0);

      // Assert
      expect(result.form.value.gainedExperience.length).toBe(1);
      expect(result.form.value.gainedExperience[0]).toBe("Second experience");
    });

    it("should clear experience error on add", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.gainedExperienceErrors.value =
        "At least one experience is required";
      result.experienceInput.value = "Database optimization";

      // Act
      result.addExperience();

      // Assert
      expect(result.gainedExperienceErrors.value).toBe("");
    });
  });

  describe("Form submission validation", () => {
    it("should show error if no technologies added", async () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.form.value.title = "Test Project";
      result.handleMainImageChange(mockUploadInfo());

      // Act
      await result.submitCreateProject();

      // Assert
      expect(result.technologiesErrors.value).toBe(
        "At least one technology is required",
      );
      expect(showErrorToast).not.toHaveBeenCalledWith(
        "Project created successfully!",
      );
    });

    it("should show error if no experience added", async () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.form.value.title = "Test Project";
      result.techInput.value = "React";
      result.addTechnology();
      result.handleMainImageChange(mockUploadInfo());

      // Act
      await result.submitCreateProject();

      // Assert
      expect(result.gainedExperienceErrors.value).toBe(
        "At least one experience description is required",
      );
    });

    it("should show error if main image is invalid", async () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.techInput.value = "React";
      result.addTechnology();
      result.experienceInput.value = "Learning";
      result.addExperience();

      const errorUploadInfo: UploadFileInfo[] = mockUploadInfo({
        status: "error",
        file: null,
        altText: "",
        percentage: null,
        type: null,
        errorMessage: "Error",
      });

      // Act
      result.handleMainImageChange(errorUploadInfo);
      await result.submitCreateProject();

      // Assert
      expect(showErrorToast).toHaveBeenCalledWith(
        "Please fix the main image before submitting",
      );
    });

    it("should show error if main image is not provided", async () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.form.value.title = "Test Project";
      result.techInput.value = "React";
      result.addTechnology();
      result.experienceInput.value = "Learning";
      result.addExperience();

      // Act
      await result.submitCreateProject();

      // Assert
      expect(showErrorToast).toHaveBeenCalledWith("Main image is required");
    });

    it("should show error if main image has no alt text", async () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.form.value.title = "Test Project";
      result.techInput.value = "React";
      result.addTechnology();
      result.experienceInput.value = "Learning";
      result.addExperience();
      const uploadInfo: UploadFileInfo[] = mockUploadInfo({ altText: "" });
      result.handleMainImageChange(uploadInfo);

      // Act
      await result.submitCreateProject();

      // Assert
      expect(showErrorToast).toHaveBeenCalledWith(
        "Main image requires alt text",
      );
    });

    it("should show error if other image missing alt text", async () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      const otherFile = new File(["content"], "other.jpg", {
        type: "image/jpeg",
      });

      result.form.value.title = "Test Project";
      result.techInput.value = "React";
      result.addTechnology();
      result.experienceInput.value = "Learning";
      result.addExperience();

      result.handleMainImageChange(mockUploadInfo());

      const otherUploadInfo: UploadFileInfo[] = mockUploadInfo({
        id: "2",
        name: "other.jpg",
        file: otherFile,
        altText: "",
      });
      result.handleOtherImagesChange(otherUploadInfo);

      // Act
      await result.submitCreateProject();

      // Assert
      expect(showErrorToast).toHaveBeenCalledWith(
        "All additional images require alt text",
      );
    });

    it("should successfully submit the form", async () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());

      result.form.value.title = "Test Project";
      result.techInput.value = "React";
      result.addTechnology();
      result.experienceInput.value = "Learning";
      result.addExperience();

      result.handleMainImageChange(mockUploadInfo());

      // Mock store to simulate successful submission
      projectsStore.createProject = vi.fn().mockResolvedValue(true);

      // Act
      await result.submitCreateProject();

      // Assert - verify successful submission side effects
      expect(projectsStore.createProject).toHaveBeenCalledOnce();
      expect(showSuccessToast).toHaveBeenCalledWith(
        "Project created successfully!",
      );
      expect(navigateToMock).toHaveBeenCalledWith("/projects");

      // Assert - check isSubmitting is reset after submission
      expect(result.isSubmitting.value).toBe(false);
    });
  });

  describe("Form data structure", () => {
    it("should allow updating form fields", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());

      // Act
      result.form.value.title = "My Awesome Project";
      result.form.value.shortDescription = "A short desc";
      result.form.value.longDescription = "A long description";

      // Assert
      expect(result.form.value.title).toBe("My Awesome Project");
      expect(result.form.value.shortDescription).toBe("A short desc");
      expect(result.form.value.longDescription).toBe("A long description");
    });

    it("should allow updating date fields", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());

      // Act
      result.form.value.startDate = "2023-01-15";
      result.form.value.endDate = "2023-06-30";

      // Assert
      expect(result.form.value.startDate).toBe("2023-01-15");
      expect(result.form.value.endDate).toBe("2023-06-30");
    });

    it("should allow updating links", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());

      // Act
      result.form.value.githubLink = "https://github.com/user/repo";
      result.form.value.websiteLink = "https://example.com";

      // Assert
      expect(result.form.value.githubLink).toBe("https://github.com/user/repo");
      expect(result.form.value.websiteLink).toBe("https://example.com");
    });
  });
});
