import type {
  BasicProjectInformation,
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
    };
  },
  getters: {
    /**
     * Projects mapped with basic information properties
     *
     * @param state - store state
     * @returns array of projects with basic information
     */
    basicProjectInformation(state): BasicProjectInformation[] {
      return state.projects.map((p) => ({
        _id: p._id,
        title: p.title,
        technologies: p.technologies.filter((_, i) => i < 3), // first three technologies
        shortDescription: p.shortDescription,
        mainImage: p.mainImage,
      }));
    },
  },
  actions: {
    setProjects(projectsArray: Project[]): void {
      this.projects = projectsArray;
    },
    /**
     * Fetches projects and sets the response to 'projects' state
     * @async
     */
    async fetchProjects(): Promise<void> {
      const { baseApiPath } = useRuntimeConfig().public;
      try {
        const res = await $fetch<ProjectsResponse>(`${baseApiPath}/projects`);
        this.setProjects(res.projects);
      } catch (e) {
        console.error("Failed to fetch projects:", e);
      }
    },
  },
});
