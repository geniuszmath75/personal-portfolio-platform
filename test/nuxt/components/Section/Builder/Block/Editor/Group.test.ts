import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/vue";
import { ref } from "vue";
import { renderWithNuxt } from "~~/test/setup";
import GroupEditor from "~/components/Section/Builder/Block/Editor/Group.vue";
import { BlockKind } from "~~/shared/types/enums";

function renderGroupEditor(
  options: {
    header?: string;
    items?: { icon: string; label: string }[];
    disabled?: boolean;
  } = {},
) {
  const block = ref<Extract<Block, { kind: BlockKind.GROUP }>>({
    kind: BlockKind.GROUP,
    header: options.header,
    items: options.items ?? [{ icon: "", label: "" }],
  });

  renderWithNuxt(GroupEditor, {
    props: {
      modelValue: block.value,
      disabled: options.disabled,
      "onUpdate:modelValue": (
        value: Extract<Block, { kind: BlockKind.GROUP }>,
      ) => {
        block.value = value;
      },
    },
  });

  return { block };
}

describe("SectionBuilderBlockEditorGroup", () => {
  it("should render optional group header and item fields", () => {
    renderGroupEditor({
      header: "Frontend",
      items: [{ icon: "mdi:vuejs", label: "Vue.js" }],
    });

    expect(screen.getByText("Group header")).toBeInTheDocument();
    expect(screen.getByText("(optional)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Frontend")).toHaveValue("Frontend");
    expect(screen.getByPlaceholderText("mdi:vuejs")).toHaveValue("mdi:vuejs");
    expect(screen.getByPlaceholderText("Vue.js")).toHaveValue("Vue.js");
  });

  it("should update the group header", async () => {
    const { block } = renderGroupEditor();

    const headerInput = screen.getByPlaceholderText(
      "Frontend",
    ) as HTMLInputElement;
    headerInput.value = "Backend";
    headerInput.dispatchEvent(new Event("input"));

    expect(block.value.header).toBe("Backend");
  });

  it("should clear the header when only whitespace is entered", async () => {
    const { block } = renderGroupEditor({ header: "Frontend" });

    const headerInput = screen.getByPlaceholderText(
      "Frontend",
    ) as HTMLInputElement;
    headerInput.value = "   ";
    headerInput.dispatchEvent(new Event("input"));

    expect(block.value.header).toBeUndefined();
  });

  it("should add another group item", async () => {
    const { block } = renderGroupEditor();

    await fireEvent.click(screen.getByRole("button", { name: "Add item" }));

    expect(block.value.items).toHaveLength(2);
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("should remove a group item when more than one exists", async () => {
    const { block } = renderGroupEditor({
      items: [
        { icon: "mdi:vuejs", label: "Vue.js" },
        { icon: "mdi:react", label: "React" },
      ],
    });

    const removeButtons = screen
      .getAllByRole("button")
      .filter((button) => !button.textContent?.includes("Add item"));

    await fireEvent.click(removeButtons[0]!);

    expect(block.value.items).toEqual([{ icon: "mdi:react", label: "React" }]);
  });

  it("should disable actions when disabled prop is true", () => {
    renderGroupEditor({ disabled: true });

    expect(screen.getByRole("button", { name: "Add item" })).toBeDisabled();
    expect(screen.getByPlaceholderText("Frontend")).toBeDisabled();
  });
});
