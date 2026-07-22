import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PaginationProperties, CreateProjectForm } from "~~/shared/types";
import type { ValidatedProject } from "~/utils/validateProject";
import { ProjectSourceType, ProjectStatusType } from "~~/shared/types/enums";
import { setActivePinia } from "pinia";
import { createTestPinia } from "~~/test/setup";
import { useProjectsStore } from "~/stores/projectsStore";

mockNuxtImport("useRuntimeConfig", (original) => {
  return () => {
    const config = original();
    return {
      ...config,
      public: {
        ...config.public,
        baseApiPath: "/api/v1",
      },
    };
  };
});

// Auto-imported `$fetch` is not the same binding as `globalThis.$fetch`,
// so vi.stubGlobal no longer works under Vitest / test-utils v4.
const { $fetchMock } = vi.hoisted(() => ({
  $fetchMock: vi.fn(),
}));

mockNuxtImport("$fetch", () => $fetchMock);

vi.mock("~/utils/validateProject", () => ({
  projectSchema: {
    parse: vi.fn((p) => p),
  },
}));

vi.mock("~/utils/validateImageUpload", () => ({
  imageCreationResponseSchema: {
    parse: vi.fn((p) => p),
  },
}));

describe("projectsStore", () => {
  const mockProjects: ValidatedProject[] = [
    {
      _id: "1",
      title: "Test Project 1",
      technologies: ["Vue", "Nuxt", "Pinia", "Tailwind"],
      startDate: new Date("2023-01-01"),
      endDate: null,
      shortDescription: "Short desc 1",
      longDescription: "Long desc 1".repeat(10),
      githubLink: null,
      websiteLink: null,
      mainImage: {
        srcPath: "/images/projects/project1.jpg",
        altText: "project1",
      },
      projectSource: ProjectSourceType.HOBBY,
      status: ProjectStatusType.IN_PROGRESS,
      gainedExperience: ["Testing", "State Management"],
    },
    {
      _id: "2",
      title: "Test Project 2",
      technologies: ["Java", "Spring Boot"],
      startDate: new Date("2023-06-01"),
      endDate: null,
      shortDescription: "Short desc 2",
      longDescription: "Long desc 2".repeat(10),
      githubLink: null,
      websiteLink: null,
      mainImage: {
        srcPath: "/images/projects/project2.jpg",
        altText: "project2",
      },
      projectSource: ProjectSourceType.UNIVERSITY,
      status: ProjectStatusType.COMPLETED,
      gainedExperience: ["Backend Development", "APIs"],
    },
  ];

  const mockPagination: PaginationProperties = {
    page: 1,
    limit: 5,
    totalPages: 1,
    prevPage: null,
    nextPage: null,
    totalDocuments: 3,
  };

  const mockFormData: CreateProjectForm = {
    title: "New Project",
    shortDescription: "A new project",
    longDescription: "Long description of the project",
    technologies: ["Vue", "Nuxt"],
    projectSource: ProjectSourceType.HOBBY,
    status: ProjectStatusType.IN_PROGRESS,
    startDate: "2024-01-01",
    endDate: "",
    gainedExperience: ["Learning"],
    githubLink: "https://github.com/test/project",
    websiteLink: "",
  };

  beforeEach(() => {
    setActivePinia(createTestPinia());
    vi.resetAllMocks();
  });

  it("should have default state", () => {
    // Arrange: create a new projects store
    const store = useProjectsStore();

    // Assert: the default state should be an empty/initial values
    expect(store.projects).toEqual([]);
    expect(store.pagination).toBeNull();
    expect(store.loading).toBe(true);
    expect(store.projectCount).toBe(0);
  });

  it("should 'setProjects' updates state", () => {
    // Arrange: create store
    const store = useProjectsStore();

    // Act: call setProjects with mocked data
    store.setProjects(mockProjects, 2);

    // Assert: store state should match provided mock data
    expect(store.projects).toEqual(mockProjects);
    expect(store.projectCount).toEqual(2);
  });

  it("should 'basicProjectInformation' return mapped projects with max 3 technologies", () => {
    // Arrange: create store and set mocked projects
    const store = useProjectsStore();
    store.setProjects(mockProjects, 2);

    // Act: get the basicProjectInformation getter result
    const basicInfo = store.basicProjectInformation;

    // Assert:
    // - returns correct length
    // - maps required fields
    // - limits technologies to max 3
    expect(basicInfo).toHaveLength(2);
    expect(basicInfo[0]).toMatchObject({
      _id: "1",
      title: "Test Project 1",
      shortDescription: "Short desc 1",
      mainImage: {
        srcPath: "/images/projects/project1.jpg",
        altText: "project1",
      },
    });

    // max 3 technologies
    expect(basicInfo[0]!.technologies.length).toBe(3);
    expect(basicInfo[1]!.technologies.length).toBe(2);
  });

  it("should 'fetchProjects' set projects, count and pagination from API response", async () => {
    // Arrange: mock $fetch to resolve with mockProjects
    const store = useProjectsStore();

    $fetchMock.mockResolvedValue({
      projects: mockProjects,
      count: 2,
      pagination: mockPagination,
    });

    // Act: call fetchProjects action
    await store.fetchProjects(1, 5);

    // Assert:
    // - $fetch called with correct endpoint and correct params
    // - store updated with API response
    expect($fetchMock).toHaveBeenCalledWith("/api/v1/projects", {
      query: { page: 1, limit: 5 },
    });
    expect(store.projects).toEqual(mockProjects);
    expect(store.projectCount).toBe(2);
    expect(store.pagination).toEqual(mockPagination);
    expect(store.loading).toBe(false);
  });

  it("should 'fetchProjects' handle errors gracefully", async () => {
    // Arrange: mock $fetch to reject with an error
    const store = useProjectsStore();

    // Mock $fetch
    $fetchMock.mockRejectedValue(new Error("Network error"));

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Act: call fetchProjects action
    await store.fetchProjects();

    // Assert:
    // - error logged to console
    // - store remains unchanged (empty array)
    expect($fetchMock).toHaveBeenCalledWith("/api/v1/projects", {
      query: { page: 1, limit: 5 },
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to fetch projects:",
      expect.any(Error),
    );
    expect(store.projects).toEqual([]);
    expect(store.projectCount).toBe(0);
    expect(store.pagination).toBeNull();
    expect(store.loading).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it("should 'setPagination' update pagination state", () => {
    // Arrange: create store
    const store = useProjectsStore();

    // Act: call setPagination with mocked data
    store.setPagination(mockPagination);

    // Assert: pagination state should be updated
    expect(store.pagination).toEqual(mockPagination);
  });

  it("should 'setProjectDetails' update projectDetails state", () => {
    // Arrange: create store and mock project
    const store = useProjectsStore();
    const project = mockProjects[0];

    // Act: call setPagination with mocked data
    store.setProjectDetails(project!);

    // Assert: projectDetails state should be updated
    expect(store.projectDetails).toEqual(project);
  });

  it("should 'fetchProject' set projectDetails from API response", async () => {
    // Arrange: create store and mock project response
    const store = useProjectsStore();
    const mockProjectResponse = { project: mockProjects[0] };

    $fetchMock.mockResolvedValue(mockProjectResponse);

    // Act: call fetchProject
    await store.fetchProject("1");

    // Assert:
    // - $fetch called with correct endpoint and correct params
    // - store updated with API response
    expect($fetchMock).toHaveBeenCalledWith("/api/v1/projects/1");
    expect(store.projectDetails).toEqual(mockProjects[0]);
    expect(store.loading).toBe(false);
  });

  it("should 'fetchProject' handle fetch errors gracefully", async () => {
    // Arrange: create store and mock $fetch
    const store = useProjectsStore();

    $fetchMock.mockRejectedValue(new Error("Network error"));
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Act: call fetchProject action
    await store.fetchProject("1");

    // Assert:
    // - error logged to console
    // - store remains unchanged (null)
    expect($fetchMock).toHaveBeenCalledWith("/api/v1/projects/1");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to fetch project details:",
      expect.any(Error),
    );
    expect(store.projectDetails).toBeNull();
    expect(store.loading).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it("should 'imageList' merge main and other images without duplicates", () => {
    // Arrange: create store and images objects
    const store = useProjectsStore();

    const mainImage = { srcPath: "/images/main.jpg", altText: "main" };
    const otherImages = [
      { srcPath: "/images/extra1.jpg", altText: "extra1" },
      { srcPath: "/images/main.jpg", altText: "duplicate-main" }, // duplicate path
    ];

    // Act: update projectDetails state and call getter
    store.setProjectDetails({
      ...mockProjects[0]!,
      mainImage,
      otherImages,
    });

    const images = store.imageList;

    // Assert: should return list with two image objects
    expect(images).toHaveLength(2);
    expect(images).toContainEqual(mainImage);
    expect(images).toContainEqual(otherImages[0]);
  });

  it("should 'imageList' return empty array if no projectDetails", () => {
    const store = useProjectsStore();

    store.projectDetails = null;
    expect(store.imageList).toEqual([]);
  });

  it("should 'linkPropertiesList' return GitHub and Website links", () => {
    // Arrange: create store
    const store = useProjectsStore();

    // Act: update projectDetails state and call getter
    store.setProjectDetails({
      ...mockProjects[0]!,
      githubLink: "https://github.com/test",
      websiteLink: "https://example.com",
    });
    const links = store.linkPropertiesList;

    // Assert: should return list with 2 link properties objects
    expect(links).toHaveLength(2);
    expect(links[0]).toMatchObject({
      label: "Github  Link",
      icon: "mdi:github",
      url: "https://github.com/test",
    });
    expect(links[1]).toMatchObject({
      label: "Website  Link",
      icon: "mdi:link",
      url: "https://example.com",
    });
  });

  it("should 'linkPropertiesList' return empty array when projectDetails is null", () => {
    // Arrange: create store
    const store = useProjectsStore();

    // Assert: list should be empty
    expect(store.linkPropertiesList).toEqual([]);
  });

  it("should 'linkPropertiesList' return empty array when no links exist", () => {
    // Arrange: create store
    const store = useProjectsStore();

    // Act: update projectDetails state
    store.setProjectDetails({
      ...mockProjects[0]!,
      githubLink: null,
      websiteLink: null,
    });

    // Assert: list should be empty
    expect(store.linkPropertiesList).toEqual([]);
  });

  it("should 'formattedStartDate' and 'formattedEndDate' return formatted dates", () => {
    // Arrange: create store and project with both dates
    const store = useProjectsStore();
    const project = {
      ...mockProjects[0]!,
      startDate: new Date("2024-03-15"),
      endDate: new Date("2024-05-10"),
    };

    // Act: update projectDetails state
    store.setProjectDetails(project);

    // Assert: getters return formatted dates
    expect(store.formattedStartDate).toBe("2024-03-15");
    expect(store.formattedEndDate).toBe("2024-05-10");
  });

  it("should 'formattedStartDate' and 'formattedEndDate' return null when not set", () => {
    // Arrange: create store
    const store = useProjectsStore();

    // Assert: startDate formatted and endDate is null
    expect(store.formattedStartDate).toBeNull();
    expect(store.formattedEndDate).toBeNull();
  });

  it.each([
    {
      status: ProjectStatusType.IN_PROGRESS,
      icon: "material-symbols:hourglass-top",
      type: "info",
    },
    {
      status: ProjectStatusType.COMPLETED,
      icon: "mdi:check-circle",
      type: "success",
    },
  ])(
    "should 'getProjectStatusProperties' return correct visual props for $status status",
    ({ status, icon, type }) => {
      // Arrange: create store
      const store = useProjectsStore();

      // Act: update projectDetails state with $status variable
      store.setProjectDetails({
        ...mockProjects[0]!,
        status,
      });

      // Assert: return object with status, icon and type fields
      expect(store.getProjectStatusProperties).toEqual({
        status,
        icon,
        type,
      });
    },
  );

  it("should 'getProjectStatusProperties' return default status if projectDetails is null", () => {
    // Arrange: create store
    const store = useProjectsStore();

    // Assert: return object with default status, icon and type fields
    expect(store.getProjectStatusProperties).toEqual({
      status: ProjectStatusType.COMPLETED,
      icon: "mdi:check-circle",
      type: "success",
    });
  });

  it.each([
    { source: ProjectSourceType.COMPANY, icon: "mdi:company" },
    { source: ProjectSourceType.UNIVERSITY, icon: "mdi:school" },
    {
      source: ProjectSourceType.HOBBY,
      icon: "mdi:local-florist",
    },
  ])(
    "should 'getProjectSourceProperties' return correct source and icon for $source source",
    ({ source, icon }) => {
      // Arrange: create store
      const store = useProjectsStore();

      // Act: update projectDetails state with $source variable
      store.setProjectDetails({
        ...mockProjects[0]!,
        projectSource: source,
      });

      // Assert: return object with source and icon fields
      expect(store.getProjectSourceProperties).toEqual({
        source,
        icon,
      });
    },
  );

  it("should 'getProjectSourceProperties' return default status if projectDetails is null", () => {
    // Arrange: create store
    const store = useProjectsStore();

    // Assert: return object with default source and icon fields
    expect(store.getProjectSourceProperties).toEqual({
      source: ProjectSourceType.HOBBY,
      icon: "mdi:local-florist",
    });
  });

  it("should 'uploadProjectImage' upload file and return URL on success", async () => {
    // Arrange: create store and mock file
    const store = useProjectsStore();
    const mockFile = new File(["image data"], "test.jpg", {
      type: "image/jpeg",
    });
    const mockResponse = {
      success: true,
      data: { url: "/uploads/projects/test.jpg" },
    };

    $fetchMock.mockResolvedValue(mockResponse);

    // Act: call uploadProjectImage action
    const result = await store.uploadProjectImage(mockFile);

    // Assert:
    // - $fetch called with correct endpoint and FormData
    // - returns uploaded image URL
    expect($fetchMock).toHaveBeenCalledWith("/upload/image", {
      baseURL: "/api/v1",
      method: "POST",
      credentials: "include",
      body: expect.any(FormData),
      query: { category: "projects" },
    });
    expect(result).toBe("/uploads/projects/test.jpg");
  });

  it("should 'uploadProjectImage' return null on failure", async () => {
    // Arrange: create store and mock file
    const store = useProjectsStore();
    const mockFile = new File(["image data"], "test.jpg", {
      type: "image/jpeg",
    });

    $fetchMock.mockRejectedValue(new Error("Upload failed"));
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Act: call uploadProjectImage action
    const result = await store.uploadProjectImage(mockFile);

    // Assert:
    // - returns null on error
    // - error is handled
    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("should 'createProject' upload images and create project successfully", async () => {
    // Arrange: create store and mock data
    const store = useProjectsStore();
    const mainImageFile = {
      file: new File(["main"], "main.jpg", { type: "image/jpeg" }),
      altText: "Main image",
    };
    const otherImageFiles = [
      {
        file: new File(["other"], "other.jpg", { type: "image/jpeg" }),
        altText: "Other image",
      },
    ];

    // Mock uploadProjectImage to return URLs
    vi.spyOn(store, "uploadProjectImage")
      .mockResolvedValueOnce("/uploads/projects/main.jpg")
      .mockResolvedValueOnce("/uploads/projects/other.jpg");

    $fetchMock.mockResolvedValue({});

    // Act: call createProject action
    const result = await store.createProject(
      mockFormData,
      mainImageFile,
      otherImageFiles,
    );

    // Assert:
    // - returns true on success
    // - loading state is false
    // - $fetch called with correct endpoint and payload
    expect(result).toBe(true);
    expect(store.loading).toBe(false);
    expect($fetchMock).toHaveBeenCalledWith(
      "/projects",
      expect.objectContaining({
        baseURL: "/api/v1",
        method: "POST",
        credentials: "include",
      }),
    );
  });

  it("should 'createProject' fail if main image upload fails", async () => {
    // Arrange: create store and mock data
    const store = useProjectsStore();
    const mainImageFile = {
      file: new File(["main"], "main.jpg", { type: "image/jpeg" }),
      altText: "Main image",
    };
    const otherImageFiles = [
      {
        file: new File(["other"], "other.jpg", { type: "image/jpeg" }),
        altText: "Other image",
      },
    ];

    // Mock uploadProjectImage to fail for main image
    vi.spyOn(store, "uploadProjectImage")
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce("/uploads/projects/other.jpg");

    // Act: call createProject action
    const result = await store.createProject(
      mockFormData,
      mainImageFile,
      otherImageFiles,
    );

    // Assert:
    // - returns false on main image upload failure
    // - loading state is false
    expect(result).toBe(false);
    expect(store.loading).toBe(false);
  });

  it("should 'createProject' fail if other image upload fails", async () => {
    // Arrange: create store and mock data
    const store = useProjectsStore();
    const mainImageFile = {
      file: new File(["main"], "main.jpg", { type: "image/jpeg" }),
      altText: "Main image",
    };
    const otherImageFiles = [
      {
        file: new File(["other1"], "other1.jpg", { type: "image/jpeg" }),
        altText: "Other image 1",
      },
      {
        file: new File(["other2"], "other2.jpg", { type: "image/jpeg" }),
        altText: "Other image 2",
      },
    ];

    // Mock uploadProjectImage: main success, first other success, second other fails
    vi.spyOn(store, "uploadProjectImage")
      .mockResolvedValueOnce("/uploads/projects/main.jpg")
      .mockResolvedValueOnce("/uploads/projects/other1.jpg")
      .mockResolvedValueOnce(null); // second other image fails

    // Act: call createProject action
    const result = await store.createProject(
      mockFormData,
      mainImageFile,
      otherImageFiles,
    );

    // Assert:
    // - returns false if any other image upload fails
    // - loading state is false
    expect(result).toBe(false);
    expect(store.loading).toBe(false);
  });

  it("should 'createProject' handle API errors gracefully", async () => {
    // Arrange: create store and mock data
    const store = useProjectsStore();
    const mainImageFile = {
      file: new File(["main"], "main.jpg", { type: "image/jpeg" }),
      altText: "Main image",
    };

    // Mock successful image uploads but failed project creation
    vi.spyOn(store, "uploadProjectImage").mockResolvedValue(
      "/uploads/projects/main.jpg",
    );

    $fetchMock.mockRejectedValue(new Error("API error"));
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Act: call createProject action
    const result = await store.createProject(mockFormData, mainImageFile, []);

    // Assert:
    // - returns false on API error
    // - loading state is false
    // - error is logged
    expect(result).toBe(false);
    expect(store.loading).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  describe("updateProject", () => {
    const projectId = "abc123";
    const existingMainImage = {
      srcPath: "/images/projects/existing-main.jpg",
      altText: "Existing main",
    };

    it("should upload new images and PUT project successfully", async () => {
      const store = useProjectsStore();
      const mainImageFile = {
        file: new File(["main"], "main.jpg", { type: "image/jpeg" }),
        altText: "New main image",
      };
      const otherImageFiles = [
        {
          file: null,
          srcPath: "/images/projects/existing-other.jpg",
          altText: "Kept other image",
        },
        {
          file: new File(["other"], "other.jpg", { type: "image/jpeg" }),
          altText: "New other image",
        },
      ];

      const uploadSpy = vi
        .spyOn(store, "uploadProjectImage")
        .mockResolvedValueOnce("/uploads/projects/new-main.jpg")
        .mockResolvedValueOnce("/uploads/projects/new-other.jpg");

      $fetchMock.mockResolvedValue({});

      const result = await store.updateProject(
        projectId,
        mockFormData,
        mainImageFile,
        existingMainImage,
        otherImageFiles,
      );

      expect(result).toBe(true);
      expect(store.loading).toBe(false);
      expect(uploadSpy).toHaveBeenCalledTimes(2);
      expect(uploadSpy).toHaveBeenNthCalledWith(1, mainImageFile.file);
      expect(uploadSpy).toHaveBeenNthCalledWith(
        2,
        otherImageFiles[1]!.file,
        "projects",
      );
      expect($fetchMock).toHaveBeenCalledWith(`/projects/${projectId}`, {
        baseURL: "/api/v1",
        method: "PUT",
        credentials: "include",
        body: {
          ...mockFormData,
          mainImage: {
            srcPath: "/uploads/projects/new-main.jpg",
            altText: "New main image",
          },
          otherImages: [
            {
              srcPath: "/images/projects/existing-other.jpg",
              altText: "Kept other image",
            },
            {
              srcPath: "/uploads/projects/new-other.jpg",
              altText: "New other image",
            },
          ],
          githubLink: "https://github.com/test/project",
          websiteLink: null,
          endDate: null,
        },
      });
    });

    it("should keep existing main image when no new file is provided", async () => {
      const store = useProjectsStore();
      const otherImageFiles = [
        {
          file: null,
          srcPath: "/images/projects/existing-other.jpg",
          altText: "Kept other image",
        },
      ];

      const uploadSpy = vi.spyOn(store, "uploadProjectImage");
      $fetchMock.mockResolvedValue({});

      const result = await store.updateProject(
        projectId,
        mockFormData,
        null,
        existingMainImage,
        otherImageFiles,
      );

      expect(result).toBe(true);
      expect(uploadSpy).not.toHaveBeenCalled();
      expect($fetchMock).toHaveBeenCalledWith(
        `/projects/${projectId}`,
        expect.objectContaining({
          method: "PUT",
          body: expect.objectContaining({
            mainImage: {
              srcPath: existingMainImage.srcPath,
              altText: existingMainImage.altText,
            },
            otherImages: [
              {
                srcPath: "/images/projects/existing-other.jpg",
                altText: "Kept other image",
              },
            ],
          }),
        }),
      );
    });

    it("should fail if main image upload fails", async () => {
      const store = useProjectsStore();
      const mainImageFile = {
        file: new File(["main"], "main.jpg", { type: "image/jpeg" }),
        altText: "New main image",
      };

      vi.spyOn(store, "uploadProjectImage").mockResolvedValueOnce(null);

      const result = await store.updateProject(
        projectId,
        mockFormData,
        mainImageFile,
        existingMainImage,
        [],
      );

      expect(result).toBe(false);
      expect(store.loading).toBe(false);
    });

    it("should fail if other image upload fails", async () => {
      const store = useProjectsStore();
      const otherImageFiles = [
        {
          file: new File(["other"], "other.jpg", { type: "image/jpeg" }),
          altText: "New other image",
        },
      ];

      vi.spyOn(store, "uploadProjectImage").mockResolvedValueOnce(null);

      const result = await store.updateProject(
        projectId,
        mockFormData,
        null,
        existingMainImage,
        otherImageFiles,
      );

      expect(result).toBe(false);
      expect(store.loading).toBe(false);
    });

    it("should handle API errors gracefully", async () => {
      const store = useProjectsStore();

      $fetchMock.mockRejectedValue(new Error("API error"));
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await store.updateProject(
        projectId,
        mockFormData,
        null,
        existingMainImage,
        [],
      );

      expect(result).toBe(false);
      expect(store.loading).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
