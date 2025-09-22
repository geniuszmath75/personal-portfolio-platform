import { describe, expect, it, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import ProjectCard from "../../../app/components/ProjectCard.vue";
import type { BasicProjectInformation } from "../../../shared/types/index";
import { renderWithNuxt } from "../../setup";
import { fireEvent, screen } from "@testing-library/vue";

// Mock useRouter
const pushMock = vi.fn();
mockNuxtImport("useRouter", () => {
  return () => ({
    push: pushMock,
  });
});

describe("ProjectCard", () => {
  // Dummy project data
  const mockProject: BasicProjectInformation = {
    _id: "123",
    title: "Test Project",
    technologies: ["Vue", "TypeScript", "Tailwind"],
    shortDescription: "This is a test project",
    mainImage: {
      srcPath: "/images/projects/project1.jpg",
      altText: "test image",
    },
  };

  it("should render project image with correct src and alt", () => {
    // Arrange & act: render ProjectCard with mock data
    renderWithNuxt(ProjectCard, { props: { project: mockProject } });

    // Assert: image is rendered with correct attributes
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", mockProject.mainImage.srcPath);
    expect(img).toHaveAttribute("alt", mockProject.mainImage.altText);
  });

  it("should render project title", () => {
    // Arrange & Act
    renderWithNuxt(ProjectCard, { props: { project: mockProject } });

    // Assert: title is shown
    expect(screen.getByText(mockProject.title)).toBeInTheDocument();
  });

  it("should render all technologies", () => {
    // Arrange & Act
    renderWithNuxt(ProjectCard, { props: { project: mockProject } });

    // Assert: each technology is rendered
    mockProject.technologies.forEach((tech) => {
      expect(screen.getByText(tech)).toBeInTheDocument();
    });
  });

  it("should render short description", () => {
    // Arrange & Act
    renderWithNuxt(ProjectCard, { props: { project: mockProject } });

    // Assert: short description is visible
    expect(screen.getByText(mockProject.shortDescription)).toBeInTheDocument();
  });

  it("should call router.push with project id when button clicked", async () => {
    // Arrange
    renderWithNuxt(ProjectCard, { props: { project: mockProject } });

    // Act: click button
    const button = screen.getByRole("button", { name: /check details/i });
    await fireEvent.click(button);

    // Assert: router.push called with correct path
    expect(pushMock).toHaveBeenCalledWith(`/projects/${mockProject._id}`);
  });

  it("should handle case with no technologies gracefully", () => {
    // Arrange: project with empty technologies
    const projectWithoutTech = { ...mockProject, technologies: [] };

    // Act
    renderWithNuxt(ProjectCard, { props: { project: projectWithoutTech } });

    // Assert: no technology chips rendered
    projectWithoutTech.technologies.forEach((tech) => {
      expect(screen.queryByText(tech)).not.toBeInTheDocument();
    });

    // Still renders title and description
    expect(screen.getByText(projectWithoutTech.title)).toBeInTheDocument();

    expect(
      screen.getByText(projectWithoutTech.shortDescription),
    ).toBeInTheDocument();
  });
});
