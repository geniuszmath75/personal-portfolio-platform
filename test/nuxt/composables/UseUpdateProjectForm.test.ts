import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "vue-composable-tester";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { setActivePinia } from "pinia";
import { useUpdateProjectForm } from "~/composables/useUpdateProjectForm";
import { useProjectsStore } from "~/stores/projectsStore";
import { showErrorToast, showSuccessToast } from "~/utils/toastNotification";
import { createTestPinia } from "~~/test/setup";
import type { UploadFileInfo } from "~/types/components";
import type { ValidatedProject } from "~/utils/validateProject";
import { ProjectSourceType, ProjectStatusType } from "~~/shared/types/enums";

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

describe("useUpdateProjectForm composable", () => {
  const projectId = "abc123";
  let projectsStore: ReturnType<typeof useProjectsStore>;

  const mockFile = new File(["content"], "image.jpg", { type: "image/jpeg" });

  const mockProjectDetails: ValidatedProject = {
    _id: projectId,
    title: "Existing Project",
    shortDescription: "Short description",
    longDescription: "Long description of the project".repeat(10),
    technologies: ["Vue", "Nuxt"],
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-06-30"),
    githubLink: "https://github.com/user/repo",
    websiteLink: "",
    mainImage: {
      srcPath: "/images/projects/main.jpg",
      altText: "Main alt",
    },
    otherImages: [
      { srcPath: "/images/projects/other1.jpg", altText: "Other 1" },
    ],
    projectSource: ProjectSourceType.HOBBY,
    status: ProjectStatusType.COMPLETED,
    gainedExperience: ["Learned Vue"],
  };

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

  const existingMainImageUploadInfo = (): UploadFileInfo[] => [
    {
      id: "existing-main",
      name: "Main alt",
      status: "finished",
      file: null,
      altText: "Main alt",
      srcPath: "/images/projects/main.jpg",
      percentage: 100,
      url: "/images/projects/main.jpg",
      thumbnailUrl: "/images/projects/main.jpg",
      type: null,
      errorMessage: null,
    },
  ];

  function mountUpdateForm(id = projectId) {
    return mount(() => useUpdateProjectForm(id));
  }

  beforeEach(() => {
    setActivePinia(createTestPinia());
    projectsStore = useProjectsStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Form initialization", () => {
    it("should prefill form from projectDetails in store", () => {
      projectsStore.setProjectDetails(mockProjectDetails);

      const { result } = mountUpdateForm();

      expect(result.form.value.title).toBe("Existing Project");
      expect(result.form.value.shortDescription).toBe("Short description");
      expect(result.form.value.startDate).toBe("2024-01-15");
      expect(result.form.value.endDate).toBe("2024-06-30");
      expect(result.form.value.technologies).toEqual(["Vue", "Nuxt"]);
      expect(result.form.value.gainedExperience).toEqual(["Learned Vue"]);
      expect(result.form.value.githubLink).toBe("https://github.com/user/repo");
    });

    it("should initialize controlled file lists from projectDetails", () => {
      projectsStore.setProjectDetails(mockProjectDetails);

      const { result } = mountUpdateForm();

      expect(result.initialMainImageFileList.value).toHaveLength(1);
      expect(result.initialMainImageFileList.value[0]).toMatchObject({
        altText: "Main alt",
        srcPath: "/images/projects/main.jpg",
        file: null,
        status: "finished",
      });
      expect(result.initialOtherImagesFileList.value).toHaveLength(1);
      expect(result.initialOtherImagesFileList.value[0]).toMatchObject({
        altText: "Other 1",
        srcPath: "/images/projects/other1.jpg",
        file: null,
      });
    });

    it("should use empty defaults when projectDetails is null", () => {
      const { result } = mountUpdateForm();

      expect(result.form.value.title).toBe("");
      expect(result.form.value.technologies).toEqual([]);
      expect(result.initialMainImageFileList.value).toEqual([]);
      expect(result.initialOtherImagesFileList.value).toEqual([]);
      expect(result.isMainImageInvalid.value).toBe(false);
    });
  });

  describe("Controlled file list updates", () => {
    it("should sync main image file list via handleMainImageFileListUpdate", () => {
      projectsStore.setProjectDetails(mockProjectDetails);
      const { result } = mountUpdateForm();
      const updatedList = mockUploadInfo({ id: "updated-main" });

      result.handleMainImageFileListUpdate(updatedList);

      expect(result.initialMainImageFileList.value).toEqual(updatedList);
    });

    it("should sync other images file list via handleOtherImagesFileListUpdate", () => {
      projectsStore.setProjectDetails(mockProjectDetails);
      const { result } = mountUpdateForm();
      const updatedList = mockUploadInfo({ id: "updated-other" });

      result.handleOtherImagesFileListUpdate(updatedList);

      expect(result.initialOtherImagesFileList.value).toEqual(updatedList);
    });
  });

  describe("Main image handling", () => {
    beforeEach(() => {
      projectsStore.setProjectDetails(mockProjectDetails);
    });

    it("should submit with existing main image without re-upload", async () => {
      const { result } = mountUpdateForm();

      projectsStore.updateProject = vi.fn().mockResolvedValue(true);

      await result.submitUpdateProject();

      expect(projectsStore.updateProject).toHaveBeenCalledWith(
        projectId,
        expect.objectContaining({ title: "Existing Project" }),
        null,
        {
          srcPath: "/images/projects/main.jpg",
          altText: "Main alt",
        },
        [
          {
            file: null,
            altText: "Other 1",
            srcPath: "/images/projects/other1.jpg",
          },
        ],
      );
    });

    it("should pass new main image file to updateProject when replaced", async () => {
      const { result } = mountUpdateForm();
      const newFile = new File(["new"], "new-main.jpg", {
        type: "image/jpeg",
      });

      result.handleMainImageChange(
        mockUploadInfo({
          file: newFile,
          altText: "New main alt",
        }),
      );

      projectsStore.updateProject = vi.fn().mockResolvedValue(true);

      await result.submitUpdateProject();

      expect(projectsStore.updateProject).toHaveBeenCalledWith(
        projectId,
        expect.any(Object),
        { file: newFile, altText: "New main alt" },
        { srcPath: "", altText: "" },
        expect.any(Array),
      );
    });

    it("should preserve srcPath when main image entry has no file object", async () => {
      const { result } = mountUpdateForm();

      result.handleMainImageChange(existingMainImageUploadInfo());

      projectsStore.updateProject = vi.fn().mockResolvedValue(true);

      await result.submitUpdateProject();

      expect(projectsStore.updateProject).toHaveBeenCalledWith(
        projectId,
        expect.any(Object),
        null,
        {
          srcPath: "/images/projects/main.jpg",
          altText: "Main alt",
        },
        expect.any(Array),
      );
    });

    it("should require main image when user removes it from UI", async () => {
      const { result } = mountUpdateForm();

      result.handleMainImageChange([]);

      await result.submitUpdateProject();

      expect(showErrorToast).toHaveBeenCalledWith("Main image is required");
      expect(projectsStore.updateProject).not.toHaveBeenCalled();
    });

    it("should mark main image as invalid on upload error", async () => {
      const { result } = mountUpdateForm();

      result.handleMainImageChange(
        mockUploadInfo({
          status: "error",
          file: null,
          altText: "",
          errorMessage: "Upload failed",
        }),
      );

      await result.submitUpdateProject();

      expect(result.isMainImageInvalid.value).toBe(true);
      expect(showErrorToast).toHaveBeenCalledWith(
        "Please fix the main image before submitting",
      );
      expect(projectsStore.updateProject).not.toHaveBeenCalled();
    });
  });

  describe("Other images handling", () => {
    beforeEach(() => {
      projectsStore.setProjectDetails(mockProjectDetails);
    });

    it("should preserve srcPath for existing other images", async () => {
      const { result } = mountUpdateForm();

      result.handleOtherImagesChange([
        {
          id: "other-1",
          name: "Other 1",
          status: "finished",
          file: null,
          altText: "Other 1",
          srcPath: "/images/projects/other1.jpg",
          percentage: 100,
          url: "/images/projects/other1.jpg",
          thumbnailUrl: "/images/projects/other1.jpg",
          type: null,
          errorMessage: null,
        },
      ]);

      projectsStore.updateProject = vi.fn().mockResolvedValue(true);

      await result.submitUpdateProject();

      expect(projectsStore.updateProject).toHaveBeenCalledWith(
        projectId,
        expect.any(Object),
        null,
        expect.any(Object),
        [
          {
            file: null,
            altText: "Other 1",
            srcPath: "/images/projects/other1.jpg",
          },
        ],
      );
    });

    it("should include new other image files alongside existing ones", async () => {
      const { result } = mountUpdateForm();
      const newOtherFile = new File(["other"], "new-other.jpg", {
        type: "image/jpeg",
      });

      result.handleOtherImagesChange([
        ...existingMainImageUploadInfo().map((item) => ({
          ...item,
          id: "kept-other",
          altText: "Other 1",
          srcPath: "/images/projects/other1.jpg",
        })),
        {
          id: "new-other",
          name: "new-other.jpg",
          status: "finished",
          file: newOtherFile,
          altText: "New other",
          percentage: 100,
          url: null,
          thumbnailUrl: null,
          type: "image/jpeg",
          errorMessage: null,
        },
      ]);

      projectsStore.updateProject = vi.fn().mockResolvedValue(true);

      await result.submitUpdateProject();

      expect(projectsStore.updateProject).toHaveBeenCalledWith(
        projectId,
        expect.any(Object),
        null,
        expect.any(Object),
        expect.arrayContaining([
          {
            file: null,
            altText: "Other 1",
            srcPath: "/images/projects/other1.jpg",
          },
          { file: newOtherFile, altText: "New other" },
        ]),
      );
    });

    it("should filter out error images from other images", async () => {
      const { result } = mountUpdateForm();

      result.handleOtherImagesChange([
        {
          id: "valid",
          name: "valid.jpg",
          status: "finished",
          file: null,
          altText: "Valid",
          srcPath: "/images/projects/other1.jpg",
          percentage: 100,
          url: null,
          thumbnailUrl: null,
          type: null,
          errorMessage: null,
        },
        {
          id: "error",
          name: "error.jpg",
          status: "error",
          file: null,
          altText: "Broken",
          percentage: null,
          url: null,
          thumbnailUrl: null,
          type: null,
          errorMessage: "Upload error",
        },
      ]);

      projectsStore.updateProject = vi.fn().mockResolvedValue(true);

      await result.submitUpdateProject();

      expect(projectsStore.updateProject).toHaveBeenCalledWith(
        projectId,
        expect.any(Object),
        null,
        expect.any(Object),
        [
          {
            file: null,
            altText: "Valid",
            srcPath: "/images/projects/other1.jpg",
          },
        ],
      );
    });
  });

  describe("Technology list management", () => {
    beforeEach(() => {
      projectsStore.setProjectDetails(mockProjectDetails);
    });

    it("should add technology to the list", () => {
      const { result } = mountUpdateForm();

      result.addTechnology("React");

      expect(result.form.value.technologies).toContain("React");
    });

    it("should trim technology before adding", () => {
      const { result } = mountUpdateForm();

      result.addTechnology("  TypeScript  ");

      expect(result.form.value.technologies).toContain("TypeScript");
    });

    it("should remove technology by index", () => {
      // Arrange
      const { result } = mountUpdateForm();

      // Act
      result.removeTechnology(0);

      // Assert
      expect(result.form.value.technologies.length).toBe(1);
      expect(result.form.value.technologies[0]).toBe("Nuxt");
    });

    it("should clear technologies error on add", () => {
      const { result } = mountUpdateForm();
      result.technologiesErrors.value = "At least one technology is required";

      result.addTechnology("Node.js");

      expect(result.technologiesErrors.value).toBe("");
    });
  });

  describe("Experience list management", () => {
    beforeEach(() => {
      projectsStore.setProjectDetails(mockProjectDetails);
    });

    it("should add experience to the list", () => {
      // Arrange
      const { result } = mountUpdateForm();

      // Act
      result.addExperience("Learned React fundamentals");

      // Assert
      expect(result.form.value.gainedExperience).toContain(
        "Learned React fundamentals",
      );
    });

    it("should trim experience before adding", () => {
      const { result } = mountUpdateForm();

      result.addExperience("  API design  ");

      expect(result.form.value.gainedExperience).toContain("API design");
    });

    it("should remove experience by index", () => {
      // Arrange
      const { result } = mountUpdateForm();
      result.addExperience("Second experience");

      // Act
      result.removeExperience(0);

      // Assert
      expect(result.form.value.gainedExperience.length).toBe(1);
      expect(result.form.value.gainedExperience[0]).toBe("Second experience");
    });

    it("should clear experience error on add", () => {
      // Arrange
      const { result } = mountUpdateForm();
      result.gainedExperienceErrors.value =
        "At least one experience is required";

      // Act
      result.addExperience("Database optimization");

      // Assert
      expect(result.gainedExperienceErrors.value).toBe("");
    });
  });

  describe("Form submission validation", () => {
    beforeEach(() => {
      projectsStore.setProjectDetails(mockProjectDetails);
    });

    it("should show error if all technologies are removed", async () => {
      const { result } = mountUpdateForm();

      result.form.value.technologies = [];

      await result.submitUpdateProject();

      expect(result.technologiesErrors.value).toBe(
        "At least one technology is required",
      );
      expect(projectsStore.updateProject).not.toHaveBeenCalled();
    });

    it("should show error if all experience entries are removed", async () => {
      const { result } = mountUpdateForm();

      result.form.value.gainedExperience = [];

      await result.submitUpdateProject();

      expect(result.gainedExperienceErrors.value).toBe(
        "At least one experience description is required",
      );
    });

    it("should show error if main image has no alt text", async () => {
      const { result } = mountUpdateForm();

      result.handleMainImageChange(
        mockUploadInfo({ altText: "   ", file: mockFile }),
      );

      await result.submitUpdateProject();

      expect(showErrorToast).toHaveBeenCalledWith(
        "Main image requires alt text",
      );
    });

    it("should show error if other image is missing alt text", async () => {
      const { result } = mountUpdateForm();

      result.handleOtherImagesChange([
        {
          id: "other",
          name: "other.jpg",
          status: "finished",
          file: mockFile,
          altText: "",
          percentage: 100,
          url: null,
          thumbnailUrl: null,
          type: "image/jpeg",
          errorMessage: null,
        },
      ]);

      await result.submitUpdateProject();

      expect(showErrorToast).toHaveBeenCalledWith(
        "All additional images require alt text",
      );
    });

    it("should successfully submit and navigate to project page", async () => {
      const { result } = mountUpdateForm();

      projectsStore.updateProject = vi.fn().mockResolvedValue(true);

      await result.submitUpdateProject();

      expect(projectsStore.updateProject).toHaveBeenCalledOnce();
      expect(showSuccessToast).toHaveBeenCalledWith(
        "Project updated successfully!",
      );
      expect(navigateToMock).toHaveBeenCalledWith(`/projects/${projectId}`);
      expect(result.isSubmitting.value).toBe(false);
    });

    it("should not navigate when updateProject returns false", async () => {
      const { result } = mountUpdateForm();

      projectsStore.updateProject = vi.fn().mockResolvedValue(false);

      await result.submitUpdateProject();

      expect(showSuccessToast).not.toHaveBeenCalled();
      expect(navigateToMock).not.toHaveBeenCalled();
      expect(result.isSubmitting.value).toBe(false);
    });
  });
});
