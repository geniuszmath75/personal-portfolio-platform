import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/vue";
import { reactive } from "vue";
import { renderWithNuxt } from "~~/test/setup";
import MetadataForm from "~/components/Section/MetadataForm.vue";
import type {
  SectionMetadataFormProps,
  SectionMetadataFormState,
} from "~/types/sectionForm";
import { ISectionType } from "~~/shared/types/enums";

function makeMetadata(
  overrides?: Partial<SectionMetadataFormState>,
): SectionMetadataFormState {
  return {
    title: "",
    slug: "",
    type: ISectionType.HERO,
    order: 1,
    ...overrides,
  };
}

function makeProps(
  overrides?: Partial<SectionMetadataFormProps>,
): SectionMetadataFormProps {
  return {
    placement: "home",
    typeOptions: [
      { value: ISectionType.HERO, label: "Hero" },
      { value: ISectionType.SKILLS, label: "Skills" },
      { value: ISectionType.CONTACT, label: "Contact" },
    ],
    isSubmitting: false,
    showDuplicateTypeWarning: false,
    titleErrors: [],
    slugErrors: [],
    orderErrors: [],
    isTitleInvalid: false,
    isSlugInvalid: false,
    isOrderInvalid: false,
    touchField: vi.fn(),
    onOrderInput: vi.fn(),
    ...overrides,
  };
}

function renderMetadataForm(
  options: {
    metadata?: Partial<SectionMetadataFormState>;
    props?: Partial<SectionMetadataFormProps>;
  } = {},
) {
  const metadata = reactive(makeMetadata(options.metadata));
  const props = makeProps(options.props);

  return {
    metadata,
    ...renderWithNuxt(MetadataForm, {
      props: {
        metadata,
        ...props,
        "onUpdate:metadata": (value: SectionMetadataFormState) => {
          Object.assign(metadata, value);
        },
      },
    }),
  };
}

describe("MetadataForm.vue", () => {
  describe("placement copy", () => {
    it("should render home placement description", () => {
      renderMetadataForm({
        props: { placement: "home" },
      });

      expect(
        screen.getByText("This section will appear on the home page."),
      ).toBeInTheDocument();
    });

    it("should render standalone placement description", () => {
      renderMetadataForm({
        props: { placement: "standalone" },
      });

      expect(
        screen.getByText("This section will be a standalone page at /{slug}."),
      ).toBeInTheDocument();
    });
  });

  describe("duplicate type warning", () => {
    it("should show warning when duplicate home section type is detected", () => {
      renderMetadataForm({
        props: { showDuplicateTypeWarning: true },
      });

      expect(
        screen.getByText(
          /a section of this type already exists on the home page/i,
        ),
      ).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should hide warning when duplicate type is not detected", () => {
      renderMetadataForm({
        props: { showDuplicateTypeWarning: false },
      });

      expect(
        screen.queryByText(/a section of this type already exists/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("form fields", () => {
    it("should bind title input to metadata model", async () => {
      const { metadata, container } = renderMetadataForm();

      const titleInput = container.querySelector(
        "#section-title",
      ) as HTMLInputElement;
      await fireEvent.update(titleInput, "About our team");

      expect(metadata.title).toBe("About our team");
    });

    it("should bind slug input to metadata model", async () => {
      const { metadata, container } = renderMetadataForm();

      const slugInput = container.querySelector(
        "#section-slug",
      ) as HTMLInputElement;
      await fireEvent.update(slugInput, "about-our-team");

      expect(metadata.slug).toBe("about-our-team");
    });

    it("should call touchField when validated fields are edited", async () => {
      const touchField = vi.fn();
      const { container } = renderMetadataForm({
        props: { touchField },
      });

      await fireEvent.update(
        container.querySelector("#section-title") as HTMLInputElement,
        "Title",
      );
      await fireEvent.update(
        container.querySelector("#section-slug") as HTMLInputElement,
        "slug",
      );

      expect(touchField).toHaveBeenCalledWith("title");
      expect(touchField).toHaveBeenCalledWith("slug");
    });

    it("should show character counters for title and slug", () => {
      renderMetadataForm({
        metadata: {
          title: "Hello",
          slug: "hero",
        },
      });

      expect(screen.getByText("5 / 64")).toBeInTheDocument();
      expect(screen.getByText("4 / 50")).toBeInTheDocument();
    });

    it("should render validation errors", () => {
      const slugErrors = [
        {
          $uid: 1,
          $message: "Slug must be at least 2 characters long",
        },
      ];

      renderMetadataForm({
        props: {
          slugErrors:
            slugErrors as unknown as SectionMetadataFormProps["slugErrors"],
          isSlugInvalid: true,
        },
      });

      expect(
        screen.getByText("Slug must be at least 2 characters long"),
      ).toBeInTheDocument();
    });

    it("should disable inputs while submitting", () => {
      const { container } = renderMetadataForm({
        props: { isSubmitting: true },
      });

      expect(screen.getByPlaceholderText("About our team")).toBeDisabled();
      expect(screen.getByPlaceholderText("about-our-team")).toBeDisabled();
      expect(
        container.querySelector("#section-type") as HTMLSelectElement,
      ).toBeDisabled();
      expect(screen.getByPlaceholderText("1")).toBeDisabled();
    });

    it("should render available section type options", () => {
      const { container } = renderMetadataForm({
        props: {
          typeOptions: [{ value: ISectionType.ABOUT_ME, label: "About Me" }],
        },
      });

      const options = container.querySelectorAll("#section-type option");
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent("About Me");
      expect(options[0]).toHaveValue(ISectionType.ABOUT_ME);
    });
  });

  describe("order input", () => {
    it("should bind order input to metadata model", async () => {
      const { metadata, container } = renderMetadataForm();

      const orderInput = container.querySelector(
        "#section-order",
      ) as HTMLInputElement;
      await fireEvent.update(orderInput, "4");

      expect(metadata.order).toBe(4);
    });

    it("should reset order to 0 for empty or invalid input", async () => {
      const { metadata, container } = renderMetadataForm({
        metadata: { order: 3 },
      });

      const orderInput = container.querySelector(
        "#section-order",
      ) as HTMLInputElement;

      await fireEvent.update(orderInput, "");
      expect(metadata.order).toBe(0);

      await fireEvent.update(orderInput, "abc");
      expect(metadata.order).toBe(0);
    });

    it("should call onOrderInput and touchField when order changes", async () => {
      const touchField = vi.fn();
      const onOrderInput = vi.fn();
      const { container } = renderMetadataForm({
        props: { touchField, onOrderInput },
      });

      await fireEvent.update(
        container.querySelector("#section-order") as HTMLInputElement,
        "2",
      );

      expect(onOrderInput).toHaveBeenCalledOnce();
      expect(touchField).toHaveBeenCalledWith("order");
    });
  });
});
