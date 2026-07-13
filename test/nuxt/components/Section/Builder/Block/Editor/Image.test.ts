import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/vue";
import { renderWithNuxt } from "~~/test/setup";
import ImageEditor from "~/components/Section/Builder/Block/Editor/Image.vue";
import type { UploadFileInfo } from "~/types/components";

const mockFile = new File(["img"], "hero.jpg", { type: "image/jpeg" });

const mockFileList: UploadFileInfo[] = [
  {
    id: "file-1",
    name: "hero.jpg",
    file: mockFile,
    status: "pending",
    percentage: null,
    url: null,
    thumbnailUrl: "blob:mock-preview",
    type: "image/jpeg",
    errorMessage: null,
    altText: "Hero image",
  },
];

function renderImageEditor(
  options: {
    fileList?: UploadFileInfo[];
    disabled?: boolean;
    onUpdateFileList?: (files: UploadFileInfo[]) => void;
    onChange?: (files: UploadFileInfo[]) => void;
  } = {},
) {
  const onUpdateFileList = options.onUpdateFileList ?? vi.fn();
  const onChange = options.onChange ?? vi.fn();

  const view = renderWithNuxt(ImageEditor, {
    props: {
      fileList: options.fileList ?? [],
      disabled: options.disabled,
      "onUpdate:fileList": onUpdateFileList,
      onChange,
    },
  });

  return {
    onUpdateFileList,
    onChange,
    ...view,
  };
}

describe("SectionBuilderBlockEditorImage", () => {
  it("should render upload constraints when no file is selected", () => {
    renderImageEditor();

    expect(screen.getByText(/JPEG, PNG, WEBP/i)).toBeInTheDocument();
    expect(screen.getByText(/5 MB/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload a file here/i)).toBeInTheDocument();
  });

  it("should render selected file and alt text field", () => {
    renderImageEditor({ fileList: mockFileList });

    expect(screen.getByText("hero.jpg")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Image description (alt text)"),
    ).toHaveValue("Hero image");
  });

  it("should pass disabled state to FileUpload", () => {
    const { container } = renderImageEditor({ disabled: true });

    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    expect(fileInput.disabled).toBe(true);
  });

  it("should forward alt text changes from FileUpload", async () => {
    const onChange = vi.fn();
    renderImageEditor({
      fileList: mockFileList,
      onChange,
    });

    const altInput = screen.getByPlaceholderText(
      "Image description (alt text)",
    ) as HTMLInputElement;
    altInput.value = "Updated alt text";
    altInput.dispatchEvent(new Event("input"));

    expect(onChange).toHaveBeenCalled();
  });
});
