import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IProject } from "../../../shared/types";
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

  beforeEach(() => {
    setActivePinia(createTestPinia());
    vi.resetAllMocks();
  });

  it("should have default state", () => {
    // Arrange: create a new projects store
    const store = useProjectsStore();

    // Assert: the default state should be an empty array
    expect(store.projects).toEqual([]);
  });

  it("should 'setProjects' updates state", () => {
    // Arrange: create store
    const store = useProjectsStore();

    // Act: call setProjects with mocked data
    store.setProjects(mockProjects);

    // Assert: store state should now equal provided mockProjects
    expect(store.projects).toEqual(mockProjects);
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

  it("should 'fetchProjects' set projects from API response", async () => {
    // Arrange: mock $fetch to resolve with mockProjects
    const store = useProjectsStore();

    vi.stubGlobal(
      "$fetch",
      vi.fn().mockResolvedValue({ projects: mockProjects }),
    );

    // Act: call fetchProjects action
    await store.fetchProjects();

    // Assert:
    // - $fetch called with correct endpoint
    // - store updated with API response
    expect($fetch).toHaveBeenCalledWith("/api/v1/projects");
    expect(store.projects).toEqual(mockProjects);
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
    expect($fetch).toHaveBeenCalledWith("/api/v1/projects");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to fetch projects:",
      expect.any(Error),
    );
    expect(store.projects).toEqual([]);

    consoleErrorSpy.mockRestore();
  });
});
