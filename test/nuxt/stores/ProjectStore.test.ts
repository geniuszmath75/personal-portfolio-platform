import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IProject, PaginationProperties } from "../../../shared/types";
import {
  ProjectSourceType,
  ProjectStatusType,
} from "../../../shared/types/enums";
import { setActivePinia } from "pinia";
import { createTestPinia } from "../../setup";
import { useProjectsStore } from "../../../app/stores/projectsStore";

mockNuxtImport("useRuntimeConfig", () => {
  return () => {
    return {
      public: {
        baseApiPath: "/api/v1",
      },
    };
  };
});

describe("projectsStore", () => {
  const mockProjects: IProject[] = [
    {
      _id: "1",
      title: "Test Project 1",
      technologies: ["Vue", "Nuxt", "Pinia", "Tailwind"],
      startDate: new Date("2023-01-01"),
      shortDescription: "Short desc 1",
      longDescription: "Long desc 1".repeat(10),
      mainImage: {
        srcPath: "/images/projects/project1.jpg",
        altText: "project1",
      },
      projectSource: ProjectSourceType.HOBBY,
      status: ProjectStatusType.IN_PROGRESS,
    },
    {
      _id: "2",
      title: "Test Project 2",
      technologies: ["Java", "Spring Boot"],
      startDate: new Date("2023-06-01"),
      shortDescription: "Short desc 2",
      longDescription: "Long desc 2".repeat(10),
      mainImage: {
        srcPath: "/images/projects/project2.jpg",
        altText: "project2",
      },
      projectSource: ProjectSourceType.UNIVERSITY,
      status: ProjectStatusType.COMPLETED,
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
    store.setProjects(mockProjects);

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
    expect(basicInfo[0].technologies.length).toBe(3);
    expect(basicInfo[1].technologies.length).toBe(2);
  });

  it("should 'fetchProjects' set projects, count and pagination from API response", async () => {
    // Arrange: mock $fetch to resolve with mockProjects
    const store = useProjectsStore();

    vi.stubGlobal(
      "$fetch",
      vi.fn().mockResolvedValue({
        projects: mockProjects,
        count: 2,
        pagination: mockPagination,
      }),
    );

    // Act: call fetchProjects action
    await store.fetchProjects(1, 5);

    // Assert:
    // - $fetch called with correct endpoint and correct params
    // - store updated with API response
    expect($fetch).toHaveBeenCalledWith("/api/v1/projects", {
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
    vi.stubGlobal(
      "$fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Act: call fetchProjects action
    await store.fetchProjects();

    // Assert:
    // - error logged to console
    // - store remains unchanged (empty array)
    expect($fetch).toHaveBeenCalledWith("/api/v1/projects", {
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
});
