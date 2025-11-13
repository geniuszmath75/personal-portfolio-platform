import { camelCase, startCase, unionBy } from "lodash";

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
     * List of available project links (e.g., GitHub, Website).
     *
     * @param state - store state
     * @returns array of link objects with label, icon and url
     */
    linkPropertiesList(state): {
      label: string;
      icon: string;
      url: string;
    }[] {
      const details = state.projectDetails;
      if (!details) return [];

      // Collect all link URLs (future fields can be added here)
      const linkUrls = [details?.githubLink, details?.websiteLink];

      // Map each valid link to a display object (label, icon, url)
      const nullableLinks = linkUrls.map((url) => {
        if (!url) return null;

        // Determine link domain type (GitHub or general website)
        const linkDomain = url?.includes("github.com") ? "github" : "website";

        // Generate label from domain name, e.g. "GitHub Link"
        const label = startCase(camelCase(linkDomain)) + "  Link";

        // Pick an appropriate icon
        const icon = linkDomain === "github" ? "mdi:github" : "mdi:link";

        return {
          label,
          icon,
          url,
        };
      });

      // Remove null entries
      const links = nullableLinks.filter(isDefinedAndNotNull);

      return links;
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

    /**
     * Visual properties of the project's status.
     *
     * @param state - store state
     * @returns status object with icon and type
     */
    getProjectStatusProperties(state): {
      status: ProjectStatusType;
      icon: string;
      type: "success" | "info";
    } {
      const status =
        state.projectDetails?.status || ProjectStatusType.COMPLETED;
      switch (status) {
        case ProjectStatusType.IN_PROGRESS:
          return {
            status,
            icon: "material-symbols:hourglass-top",
            type: "info",
          };
        default:
          return {
            status,
            icon: "mdi:check-circle",
            type: "success",
          };
      }
    },

    /**
     * Visual properties of the project's source.
     *
     * @param state - store state
     * @returns source object with type and icon
     */
    getProjectSourceProperties(state): {
      source: ProjectSourceType;
      icon: string;
    } {
      const source =
        state.projectDetails?.projectSource || ProjectSourceType.HOBBY;

      switch (source) {
        case ProjectSourceType.COMPANY:
          return { source, icon: "mdi:company" };
        case ProjectSourceType.UNIVERSITY:
          return { source, icon: "mdi:school" };
        default:
          return { source, icon: "mdi:local-florist" };
      }
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
     * @async
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
