import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/vue";
import { renderWithNuxt } from "~~/test/setup";
import PreviewShell from "~/components/Section/Builder/PreviewShell.vue";
import { BlockKind, ISectionType } from "~~/shared/types/enums";
import type { SectionMetadataFormState } from "~/types/sectionForm";

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

function renderPreviewShell(
  options: {
    metadata?: Partial<SectionMetadataFormState>;
    blocks?: Block[];
  } = {},
) {
  return renderWithNuxt(PreviewShell, {
    props: {
      metadata: makeMetadata(options.metadata),
      blocks: options.blocks ?? [],
    },
  });
}

describe("SectionBuilderPreviewShell", () => {
  it("should render live preview heading", () => {
    renderPreviewShell();

    expect(screen.getByText("Live preview")).toBeInTheDocument();
  });

  it("should render hero layout content from metadata and blocks", () => {
    renderPreviewShell({
      metadata: {
        title: "Welcome",
        slug: "home-hero",
        type: ISectionType.HERO,
        order: 1,
      },
      blocks: [
        { kind: BlockKind.PARAGRAPH, paragraphs: ["Hello there"] },
        { kind: BlockKind.BUTTON, buttons: ["PROJECTS"] },
      ],
    });

    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(screen.getByText("PROJECTS")).toBeInTheDocument();
  });

  it("should render skills layout for skills section type", () => {
    renderPreviewShell({
      metadata: {
        title: "My Skills",
        slug: "skills",
        type: ISectionType.SKILLS,
        order: 2,
      },
      blocks: [
        {
          kind: BlockKind.GROUP,
          header: "FRONTEND",
          items: [{ icon: "mdi:vuejs", label: "Vue.js" }],
        },
      ],
    });

    expect(screen.getByText("My Skills")).toBeInTheDocument();
    expect(screen.getByText("FRONTEND")).toBeInTheDocument();
    expect(screen.getByText("Vue.js")).toBeInTheDocument();
  });

  it("should apply section background class from metadata order", () => {
    const { container } = renderPreviewShell({
      metadata: { order: 2, type: ISectionType.HERO },
    });

    const previewSection = container.querySelector("section.flex.items-center");
    expect(previewSection).toHaveClass("bg-secondary-500");
  });
});
