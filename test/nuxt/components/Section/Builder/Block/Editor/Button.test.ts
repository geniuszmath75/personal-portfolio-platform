import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/vue";
import { ref } from "vue";
import { renderWithNuxt } from "~~/test/setup";
import ButtonEditor from "~/components/Section/Builder/Block/Editor/Button.vue";
import { BlockKind } from "~~/shared/types/enums";

function renderButtonEditor(
  options: {
    buttons?: string[];
    disabled?: boolean;
  } = {},
) {
  const block = ref<Extract<Block, { kind: BlockKind.BUTTON }>>({
    kind: BlockKind.BUTTON,
    buttons: options.buttons ?? [""],
  });

  renderWithNuxt(ButtonEditor, {
    props: {
      modelValue: block.value,
      disabled: options.disabled,
      "onUpdate:modelValue": (
        value: Extract<Block, { kind: BlockKind.BUTTON }>,
      ) => {
        block.value = value;
      },
    },
  });

  return { block };
}

describe("SectionBuilderBlockEditorButton", () => {
  it("should render button label fields", () => {
    renderButtonEditor({ buttons: ["PROJECTS"] });

    expect(screen.getByText("Button label 1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("PROJECTS")).toHaveValue("PROJECTS");
  });

  it("should add another button field", async () => {
    const { block } = renderButtonEditor();

    await fireEvent.click(screen.getByRole("button", { name: "Add button" }));

    expect(block.value.buttons).toHaveLength(2);
    expect(screen.getByText("Button label 2")).toBeInTheDocument();
  });

  it("should remove a button field when more than one exists", async () => {
    const { block } = renderButtonEditor({ buttons: ["PROJECTS", "ABOUT"] });

    const removeButtons = screen
      .getAllByRole("button")
      .filter((button) => !button.textContent?.includes("Add button"));

    await fireEvent.click(removeButtons[0]!);

    expect(block.value.buttons).toEqual(["ABOUT"]);
  });

  it("should disable actions when disabled prop is true", () => {
    renderButtonEditor({ disabled: true });

    expect(screen.getByRole("button", { name: "Add button" })).toBeDisabled();
    expect(screen.getByPlaceholderText("PROJECTS")).toBeDisabled();
  });
});
