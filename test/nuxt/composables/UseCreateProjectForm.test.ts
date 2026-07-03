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
      expect(result.technologiesErrors.value).toBe("");
      expect(result.gainedExperienceErrors.value).toBe("");
    });
  });

  describe("Main image handling", () => {
    it("should pass valid main image to createProject on submit", async () => {
      const { result } = mount(() => useCreateProjectForm());

      result.addTechnology("React");
      result.addExperience("Learning");
      result.handleMainImageChange(mockUploadInfo());

      projectsStore.createProject = vi.fn().mockResolvedValue(true);

      await result.submitCreateProject();

      expect(projectsStore.createProject).toHaveBeenCalledWith(
        expect.any(Object),
        { file: mockFile, altText: "Main image" },
        [],
      );
    });

    it("should clear pending main image when file list becomes empty", async () => {
      const { result } = mount(() => useCreateProjectForm());

      result.addTechnology("React");
      result.addExperience("Learning");
      result.handleMainImageChange(mockUploadInfo());
      result.handleMainImageChange([]);

      await result.submitCreateProject();

      expect(showErrorToast).toHaveBeenCalledWith("Main image is required");
      expect(projectsStore.createProject).not.toHaveBeenCalled();
    });

    it("should mark main image as invalid on upload error", async () => {
      const { result } = mount(() => useCreateProjectForm());
      const errorUploadInfo: UploadFileInfo[] = mockUploadInfo({
        status: "error",
        file: null,
        altText: "",
        errorMessage: "Upload failed",
      });

      result.addTechnology("React");
      result.addExperience("Learning");
      result.handleMainImageChange(errorUploadInfo);

      await result.submitCreateProject();

      expect(showErrorToast).toHaveBeenCalledWith(
        "Please fix the main image before submitting",
      );
      expect(projectsStore.createProject).not.toHaveBeenCalled();
    });

    it("should ignore main image entries without a file object", async () => {
      const { result } = mount(() => useCreateProjectForm());

      result.addTechnology("React");
      result.addExperience("Learning");
      result.handleMainImageChange(
        mockUploadInfo({ file: null, status: "pending" }),
      );

      await result.submitCreateProject();

      expect(showErrorToast).toHaveBeenCalledWith("Main image is required");
    });
  });

  describe("Other images handling", () => {
    it("should pass multiple valid other images to createProject", async () => {
      const { result } = mount(() => useCreateProjectForm());
      const otherFile1 = new File(["a"], "image1.jpg", { type: "image/jpeg" });
      const otherFile2 = new File(["b"], "image2.jpg", { type: "image/jpeg" });
      const uploadInfo: UploadFileInfo[] = [
        ...mockUploadInfo({
          id: "1",
          name: "image1.jpg",
          file: otherFile1,
          altText: "Image 1",
        }),
        ...mockUploadInfo({
          id: "2",
          name: "image2.jpg",
          file: otherFile2,
          altText: "Image 2",
        }),
      ];

      result.addTechnology("React");
      result.addExperience("Learning");
      result.handleMainImageChange(mockUploadInfo());
      result.handleOtherImagesChange(uploadInfo);

      projectsStore.createProject = vi.fn().mockResolvedValue(true);

      await result.submitCreateProject();

      expect(projectsStore.createProject).toHaveBeenCalledWith(
        expect.any(Object),
        { file: mockFile, altText: "Main image" },
        [
          { file: otherFile1, altText: "Image 1" },
          { file: otherFile2, altText: "Image 2" },
        ],
      );
    });

    it("should filter out error images from other images", async () => {
      const { result } = mount(() => useCreateProjectForm());
      const validFile = new File(["a"], "valid.jpg", { type: "image/jpeg" });
      const uploadInfo: UploadFileInfo[] = [
        ...mockUploadInfo({
          id: "1",
          file: validFile,
          altText: "Valid image",
        }),
        ...mockUploadInfo({
          id: "2",
          name: "error.jpg",
          status: "error",
          file: null,
          altText: "Error image",
          errorMessage: "Upload error",
        }),
      ];

      result.addTechnology("React");
      result.addExperience("Learning");
      result.handleMainImageChange(mockUploadInfo());
      result.handleOtherImagesChange(uploadInfo);

      projectsStore.createProject = vi.fn().mockResolvedValue(true);

      await result.submitCreateProject();

      expect(projectsStore.createProject).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        [{ file: validFile, altText: "Valid image" }],
      );
    });

    it("should clear other images when empty array provided", async () => {
      const { result } = mount(() => useCreateProjectForm());

      result.addTechnology("React");
      result.addExperience("Learning");
      result.handleMainImageChange(mockUploadInfo());
      result.handleOtherImagesChange(mockUploadInfo({ altText: "Image" }));
      result.handleOtherImagesChange([]);

      projectsStore.createProject = vi.fn().mockResolvedValue(true);

      await result.submitCreateProject();

      expect(projectsStore.createProject).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        [],
      );
    });
  });

  describe("Technology list management", () => {
    it("should add technology to the list", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());

      // Act
      result.addTechnology("React");

      // Assert
      expect(result.form.value.technologies).toContain("React");
    });

    it("should not add empty technology", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());

      // Act
      result.addTechnology("");
      result.addTechnology("   ");

      // Assert
      expect(result.form.value.technologies.length).toBe(0);
    });

    it("should trim technology before adding", () => {
      const { result } = mount(() => useCreateProjectForm());

      result.addTechnology("  Vue  ");

      expect(result.form.value.technologies).toEqual(["Vue"]);
    });

    it("should not add duplicate technology", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.addTechnology("Vue");

      // Act
      result.addTechnology("Vue");

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
      result.addTechnology("React");
      result.addTechnology("Vue");

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

      // Act
      result.addTechnology("Node.js");

      // Assert
      expect(result.technologiesErrors.value).toBe("");
    });
  });

  describe("Experience list management", () => {
    it("should add experience to the list", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());

      // Act
      result.addExperience("Learned React fundamentals");

      // Assert
      expect(result.form.value.gainedExperience).toContain(
        "Learned React fundamentals",
      );
    });

    it("should not add empty experience", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());

      // Act
      result.addExperience("");
      result.addExperience("   ");

      // Assert
      expect(result.form.value.gainedExperience.length).toBe(0);
    });

    it("should trim experience before adding", () => {
      const { result } = mount(() => useCreateProjectForm());

      result.addExperience("  API design  ");

      expect(result.form.value.gainedExperience).toEqual(["API design"]);
    });

    it("should not add duplicate experience", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.addExperience("API integration");

      // Act
      result.addExperience("API integration");

      // Assert
      expect(result.form.value.gainedExperience.length).toBe(1);
    });

    it("should remove experience by index", () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.addExperience("First experience");
      result.addExperience("Second experience");

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

      // Act
      result.addExperience("Database optimization");

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
      result.addTechnology("React");
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
      result.addTechnology("React");
      result.addExperience("Learning");

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
      result.addTechnology("React");
      result.addExperience("Learning");

      // Act
      await result.submitCreateProject();

      // Assert
      expect(showErrorToast).toHaveBeenCalledWith("Main image is required");
    });

    it("should show error if main image has no alt text", async () => {
      // Arrange
      const { result } = mount(() => useCreateProjectForm());
      result.form.value.title = "Test Project";
      result.addTechnology("React");
      result.addExperience("Learning");
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
      result.addTechnology("React");
      result.addExperience("Learning");
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
      result.addTechnology("React");
      result.addExperience("Learning");

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

    it("should not navigate when createProject returns false", async () => {
      const { result } = mount(() => useCreateProjectForm());

      result.addTechnology("React");
      result.addExperience("Learning");
      result.handleMainImageChange(mockUploadInfo());

      projectsStore.createProject = vi.fn().mockResolvedValue(false);

      await result.submitCreateProject();

      expect(showSuccessToast).not.toHaveBeenCalled();
      expect(navigateToMock).not.toHaveBeenCalled();
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
