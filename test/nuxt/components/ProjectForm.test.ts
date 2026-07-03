import { describe, it, expect, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/vue";
import { reactive } from "vue";
import { renderWithNuxt } from "~~/test/setup";
import ProjectForm from "~/components/ProjectForm.vue";
import type { CreateProjectForm } from "~~/shared/types";
import type { ProjectFormProps, UploadFileInfo } from "~/types/components";
import { ProjectSourceType, ProjectStatusType } from "~~/shared/types/enums";

const fileUploadStub = {
  name: "FileUpload",
  props: [
    "fileList",
    "maxFiles",
    "accept",
    "maxSizeMB",
    "disabled",
    "withAltText",
  ],
  template: `<div
    data-testid="file-upload"
    :data-max-files="maxFiles"
    :data-file-count="fileList?.length ?? 0"
    :data-disabled="disabled"
  />`,
};

function makeForm(overrides?: Partial<CreateProjectForm>): CreateProjectForm {
  return {
    title: "",
    shortDescription: "",
    longDescription: "",
    startDate: "",
    endDate: "",
    status: ProjectStatusType.COMPLETED,
    projectSource: ProjectSourceType.HOBBY,
    githubLink: "",
    websiteLink: "",
    technologies: [],
    gainedExperience: [],
    ...overrides,
  };
}

function makeProps(overrides?: Partial<ProjectFormProps>): ProjectFormProps {
  return {
    mode: "create",
    form: makeForm(),
    isSubmitting: false,
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onMainImageChange: vi.fn(),
    onOtherImagesChange: vi.fn(),
    technologiesErrors: "",
    addTechnology: vi.fn(),
    removeTechnology: vi.fn(),
    gainedExperienceErrors: "",
    addExperience: vi.fn(),
    removeExperience: vi.fn(),
    touchField: vi.fn(),
    titleErrors: [],
    shortDescriptionErrors: [],
    longDescriptionErrors: [],
    startDateErrors: [],
    githubLinkErrors: [],
    websiteLinkErrors: [],
    isTitleInvalid: false,
    isShortDescriptionInvalid: false,
    isLongDescriptionInvalid: false,
    isStartDateInvalid: false,
    isGithubLinkInvalid: false,
    isWebsiteLinkInvalid: false,
    ...overrides,
  };
}

function renderProjectForm(overrides?: Partial<ProjectFormProps>) {
  return renderWithNuxt(ProjectForm, {
    props: makeProps(overrides),
    global: {
      stubs: {
        FileUpload: fileUploadStub,
      },
    },
  });
}

describe("ProjectForm.vue", () => {
  describe("mode", () => {
    it("should render create mode labels and submit button", () => {
      renderProjectForm({ mode: "create" });

      expect(
        screen.getByRole("button", { name: /create project/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/required, displayed on project card/i),
      ).toBeInTheDocument();
    });

    it("should render edit mode labels and submit button", () => {
      renderProjectForm({ mode: "edit" });

      expect(
        screen.getByRole("button", { name: /update project/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/remove to replace/i)).toBeInTheDocument();
    });
  });

  describe("form submission", () => {
    it("should call onSubmit when the form is submitted", async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const { container } = renderProjectForm({ onSubmit });

      await fireEvent.submit(container.querySelector("form")!);

      expect(onSubmit).toHaveBeenCalledOnce();
    });
  });

  describe("technologies", () => {
    it("should call addTechnology with input value and clear the input", async () => {
      const addTechnology = vi.fn();
      const { container } = renderProjectForm({ addTechnology });

      const techInput = container.querySelector(
        "#techInput",
      ) as HTMLInputElement;
      await fireEvent.update(techInput, "Vue");
      await fireEvent.click(
        screen.getAllByRole("button", { name: /^add$/i })[0]!,
      );

      expect(addTechnology).toHaveBeenCalledWith("Vue");
      expect(techInput.value).toBe("");
    });

    it("should call addTechnology when Enter is pressed in the tech input", async () => {
      const addTechnology = vi.fn();
      const { container } = renderProjectForm({ addTechnology });

      const techInput = container.querySelector(
        "#techInput",
      ) as HTMLInputElement;
      await fireEvent.update(techInput, "Nuxt");
      await fireEvent.keyDown(techInput, { key: "Enter", code: "Enter" });

      expect(addTechnology).toHaveBeenCalledWith("Nuxt");
      expect(techInput.value).toBe("");
    });

    it("should disable the Add button when tech input is empty", () => {
      renderProjectForm();

      const addButtons = screen.getAllByRole("button", { name: /^add$/i });
      expect(addButtons[0]).toBeDisabled();
    });

    it("should display technology tags and call removeTechnology on remove", async () => {
      const removeTechnology = vi.fn();
      renderProjectForm({
        form: makeForm({ technologies: ["Vue", "Nuxt"] }),
        removeTechnology,
      });

      expect(screen.getByText("Vue")).toBeInTheDocument();
      expect(screen.getByText("Nuxt")).toBeInTheDocument();

      const removeButton = screen
        .getByText("Vue")
        .parentElement?.querySelector("button");
      await fireEvent.click(removeButton!);

      expect(removeTechnology).toHaveBeenCalledWith(0);
    });

    it("should show technologies validation error", () => {
      renderProjectForm({
        technologiesErrors: "At least one technology is required",
      });

      expect(
        screen.getByText("At least one technology is required"),
      ).toBeInTheDocument();
    });

    it("should show placeholder when no technologies are added", () => {
      renderProjectForm();

      expect(
        screen.getByText("No technologies added yet."),
      ).toBeInTheDocument();
    });
  });

  describe("gained experience", () => {
    it("should call addExperience with input value and clear the input", async () => {
      const addExperience = vi.fn();
      const { container } = renderProjectForm({ addExperience });

      const experienceInput = container.querySelector(
        "#experienceInput",
      ) as HTMLInputElement;
      await fireEvent.update(experienceInput, "Learned REST APIs");
      await fireEvent.click(
        screen.getAllByRole("button", { name: /^add$/i })[1]!,
      );

      expect(addExperience).toHaveBeenCalledWith("Learned REST APIs");
      expect(experienceInput.value).toBe("");
    });

    it("should display experience entries and call removeExperience on remove", async () => {
      const removeExperience = vi.fn();
      renderProjectForm({
        form: makeForm({ gainedExperience: ["First skill", "Second skill"] }),
        removeExperience,
      });

      expect(screen.getByText("First skill")).toBeInTheDocument();
      expect(screen.getByText("Second skill")).toBeInTheDocument();

      const experienceSection = screen
        .getByText("First skill")
        .closest("li")!
        .querySelector("button")!;
      await fireEvent.click(experienceSection);

      expect(removeExperience).toHaveBeenCalledWith(0);
    });

    it("should show gained experience validation error", () => {
      renderProjectForm({
        gainedExperienceErrors:
          "At least one experience description is required",
      });

      expect(
        screen.getByText("At least one experience description is required"),
      ).toBeInTheDocument();
    });
  });

  describe("form fields", () => {
    it("should bind title input to form.title", async () => {
      const form = reactive(makeForm());
      const { container } = renderProjectForm({ form });

      const titleInput = container.querySelector("#title") as HTMLInputElement;
      await fireEvent.update(titleInput, "My Project");

      expect(form.title).toBe("My Project");
    });

    it("should show character counters for descriptions", () => {
      renderProjectForm({
        form: makeForm({
          shortDescription: "Hello",
          longDescription: "Long text",
        }),
      });

      expect(screen.getByText("5 / 64")).toBeInTheDocument();
      expect(screen.getByText("9 / 1024")).toBeInTheDocument();
    });

    it("should call touchField when a validated field is edited", async () => {
      const touchField = vi.fn();
      const { container } = renderProjectForm({ touchField });

      await fireEvent.update(
        container.querySelector("#title") as HTMLInputElement,
        "Title",
      );

      expect(touchField).toHaveBeenCalledWith("title");
    });

    it("should disable inputs while submitting", () => {
      renderProjectForm({ isSubmitting: true });

      expect(screen.getByPlaceholderText(/awesome project/i)).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /create project/i }),
      ).toBeDisabled();
    });
  });

  describe("images", () => {
    it("should pass correct maxFiles to main and additional FileUpload slots", () => {
      renderProjectForm();

      const uploads = screen.getAllByTestId("file-upload");
      expect(uploads).toHaveLength(2);
      expect(uploads[0]).toHaveAttribute("data-max-files", "1");
      expect(uploads[1]).toHaveAttribute("data-max-files", "10");
    });

    it("should pass controlled file lists to FileUpload components", () => {
      const mainImageFileList: UploadFileInfo[] = [
        {
          id: "main-1",
          name: "main.jpg",
          status: "finished",
          file: null,
          altText: "Main",
          percentage: 100,
          url: "/main.jpg",
          thumbnailUrl: null,
          type: "image/jpeg",
          errorMessage: null,
        },
      ];
      const otherImagesFileList: UploadFileInfo[] = [
        {
          id: "other-1",
          name: "other.jpg",
          status: "finished",
          file: null,
          altText: "Other",
          percentage: 100,
          url: "/other.jpg",
          thumbnailUrl: null,
          type: "image/jpeg",
          errorMessage: null,
        },
      ];

      renderProjectForm({ mainImageFileList, otherImagesFileList });

      const uploads = screen.getAllByTestId("file-upload");
      expect(uploads[0]).toHaveAttribute("data-file-count", "1");
      expect(uploads[1]).toHaveAttribute("data-file-count", "1");
    });

    it("should disable FileUpload components while submitting", () => {
      renderProjectForm({ isSubmitting: true });

      const uploads = screen.getAllByTestId("file-upload");
      uploads.forEach((upload) => {
        expect(upload).toHaveAttribute("data-disabled", "true");
      });
    });
  });
});
