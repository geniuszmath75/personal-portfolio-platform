import type {
  BasicProjectInformation,
  Image,
  PaginationProperties,
  ProjectResponse,
  ProjectsResponse,
} from "#shared/types";
import { unionBy } from "lodash";

export const useProjectsStore = defineStore("projects", {
  state: () => {
    return {
      /**
       * List of projects
       */
      projects: [] as ValidatedProject[],

      /**
       * Selected project details
       */
      projectDetails: null as ValidatedProject | null,

      /**
       * Pagination information for the current project list
       */
      pagination: null as PaginationProperties | null,

      /**
       * Loading indicator for project-related requests
       */
      loading: true,

      /**
       * Total number of returned projects
       */
      projectCount: 0,
    };
  },
  getters: {
    /**
     * Projects mapped to only essential properties
     *
     * @param state - store state
     * @returns array of projects with basic information
     */
    basicProjectInformation(state): BasicProjectInformation[] {
      return state.projects.map((p) => ({
        _id: p._id,
        title: p.title,
        technologies: p.technologies.filter((_, i) => i < 3), // show only first 3 technologies
        shortDescription: p.shortDescription,
        mainImage: p.mainImage,
      }));
    },
    /**
     * Merged list of project images.
     *
     * @param state - store state
     * @returns array of images without duplicates
     */
    imageList(state): Image[] {
      return unionBy(
        state.projectDetails?.mainImage ? [state.projectDetails.mainImage] : [],
        state.projectDetails?.otherImages,
        "srcPath",
      );
    },

    /**
     * Formatted start date as YYYY-MM-DD
     *
     * @param state - store state
     * @returns formatted start date or null if not available
     */
    formattedStartDate(state): string | null {
      return (
        state.projectDetails?.startDate.toISOString().split("T")[0] || null
      );
    },

    /**
     * Formatted end date as YYYY-MM-DD
     *
     * @param state - store state
     * @returns formatted end date or null if not available
     */
    formattedEndDate(state): string | null {
      return state.projectDetails?.endDate?.toISOString().split("T")[0] || null;
    },
  },
  actions: {
    /**
     * Update project list and total count
     * @param projectsArray - updated list of projects
     * @param projectCount - updated number of project count
     */
    setProjects(projectsArray: ValidatedProject[], projectCount: number): void {
      this.projects = projectsArray;
      this.projectCount = projectCount;
    },

    /**
     * Update selected project details
     * @param project - updated project details
     */
    setProjectDetails(project: ValidatedProject): void {
      this.projectDetails = project;
    },

    /**
     * Update pagination state
     * @param pagination updated pagination metadata
     */

    setPagination(pagination: PaginationProperties): void {
      this.pagination = pagination;
    },

    /**
     * Fetches projects and sets the response to `projects` state
     * @param page - current page number in result set
     * @param limit - number of items returned per page.
     * @async
     */
    async fetchProjects(page = 1, limit = 5): Promise<void> {
      const { baseApiPath } = useRuntimeConfig().public;
      this.loading = true;
      try {
        // request projects with page and limit query params
        const res = await $fetch<ProjectsResponse>(`${baseApiPath}/projects`, {
          query: {
            page,
            limit,
          },
        });

        // validate response data
        const validatedProjects = res.projects.map((project) =>
          projectSchema.parse(project),
        );

        // update store state with response data
        this.setProjects(validatedProjects, res.count);
        this.setPagination(res.pagination);

        this.loading = false;
      } catch (e) {
        this.loading = false;
        console.error("Failed to fetch projects:", e);
      }
    },

    /**
     * Fetches project details and sets the response to `projectDetails`
     * state
     * @param projectId - id of searched project
     */
    async fetchProject(projectId: string): Promise<void> {
      const { baseApiPath } = useRuntimeConfig().public;
      this.loading = true;

      try {
        const res = await $fetch<ProjectResponse>(
          `${baseApiPath}/projects/${projectId}`,
        );

        // validate response data
        const validatedProject = projectSchema.parse(res.project);

        this.setProjectDetails(validatedProject);
        this.loading = false;
      } catch (e) {
        this.loading = false;
        console.error("Failed to fetch project details:", e);
      }
    },
  },
});
