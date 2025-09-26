import type {
  BasicProjectInformation,
  PaginationProperties,
  IProject as Project,
  ProjectsResponse,
} from "~~/shared/types";

export const useProjectsStore = defineStore("projects", {
  state: () => {
    return {
      /**
       * List of projects
       */
      projects: [] as Project[],

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
  },
  actions: {
    /**
     * Update project list and total count
     * @param projectsArray - updated list of projects
     * @param projectCount - updated number of project count
     */
    setProjects(projectsArray: Project[], projectCount: number): void {
      this.projects = projectsArray;
      this.projectCount = projectCount;
    },
    /**
     * Update pagination state
     * @param pagination updated pagination metadata
     */
    setPagination(pagination: PaginationProperties): void {
      this.pagination = pagination;
    },
    /**
     * Fetches projects and sets the response to 'projects' state
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

        // update store state with response data
        this.setProjects(res.projects, res.count);
        this.setPagination(res.pagination);

        this.loading = false;
      } catch (e) {
        this.loading = false;
        console.error("Failed to fetch projects:", e);
      }
    },
  },
});
