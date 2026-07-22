import { beforeEach, describe, it, expect, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/vue";
import { renderWithNuxt } from "~~/test/setup";
import FileUpload from "~/components/FileUpload.vue";
import type { UploadFileInfo } from "~/types/components";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFile(
  name = "test.txt",
  type = "text/plain",
  sizeBytes = 1024,
): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

function makeFileList(files: File[]): FileList {
  const dt = new DataTransfer();
  files.forEach((f) => dt.items.add(f));
  return dt.files;
}

function makeFileInfo(overrides: Partial<UploadFileInfo> = {}): UploadFileInfo {
  return {
    id: "file-1",
    name: "test.txt",
    file: makeFile(),
    status: "pending",
    percentage: null,
    url: null,
    thumbnailUrl: null,
    type: "text/plain",
    errorMessage: null,
    altText: "",
    ...overrides,
  };
}

const defaultProps = {
  accept: [] as string[],
};

// Node's URL.createObjectURL rejects happy-dom File (not instanceof Node Blob).
beforeEach(() => {
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:mock-url"),
      revokeObjectURL: vi.fn(),
    }),
  );
});

describe("FileUpload.vue", () => {
  // -------------------------------------------------------------------------
  // Drop zone rendering
  // -------------------------------------------------------------------------

  describe("drop zone", () => {
    it("should render the drop zone by default", () => {
      renderWithNuxt(FileUpload, { props: defaultProps });

      expect(screen.getByText(/upload a file here/i)).toBeInTheDocument();
    });

    it("should show 'files' (plural) when maxFiles > 1", () => {
      renderWithNuxt(FileUpload, {
        props: { ...defaultProps, maxFiles: 3 },
      });

      expect(screen.getByText(/upload files here/i)).toBeInTheDocument();
    });

    it("show hide the drop zone when the file limit is reached via fileList prop", () => {
      const files = [makeFileInfo({ id: "f-1" }), makeFileInfo({ id: "f-2" })];

      renderWithNuxt(FileUpload, {
        props: { ...defaultProps, maxFiles: 2, fileList: files },
      });

      expect(screen.queryByText(/upload/i)).not.toBeInTheDocument();
    });

    it("should display the accept label and max size in the drop zone hint", () => {
      renderWithNuxt(FileUpload, {
        props: { accept: ["image/jpeg", "image/png"], maxSizeMB: 2 },
      });

      expect(screen.getByText(/JPEG, PNG/)).toBeInTheDocument();
      expect(screen.getByText(/2 MB/)).toBeInTheDocument();
    });

    it("should show 'All file types' when accept is empty", () => {
      renderWithNuxt(FileUpload, { props: defaultProps });

      expect(screen.getByText(/All file types/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // File list rendering
  // -------------------------------------------------------------------------

  describe("file list", () => {
    it("should render nothing when fileList is empty", () => {
      renderWithNuxt(FileUpload, {
        props: { ...defaultProps, fileList: [] },
      });

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should render a row for each file in fileList", () => {
      const files = [
        makeFileInfo({ id: "f-1", name: "alpha.txt" }),
        makeFileInfo({ id: "f-2", name: "beta.txt" }),
      ];

      renderWithNuxt(FileUpload, {
        props: { ...defaultProps, fileList: files },
      });

      expect(screen.getByText("alpha.txt")).toBeInTheDocument();
      expect(screen.getByText("beta.txt")).toBeInTheDocument();
    });

    it("should show an image preview when thumbnailUrl is set", () => {
      const files = [makeFileInfo({ thumbnailUrl: "blob:mock-thumb" })];

      renderWithNuxt(FileUpload, {
        props: { ...defaultProps, fileList: files },
      });

      const img = screen.getByRole("img", { name: /test.txt/i });
      expect(img).toHaveAttribute("src", "blob:mock-thumb");
    });

    it("should show the file icon when no thumbnail is available", () => {
      const files = [makeFileInfo({ thumbnailUrl: null })];

      renderWithNuxt(FileUpload, {
        props: { ...defaultProps, fileList: files },
      });

      expect(
        screen.getByText("", { selector: ".i-mdi\\:file" }),
      ).toBeInTheDocument();
    });

    it("should show 'Uploaded' label for a finished file", () => {
      const files = [makeFileInfo({ status: "finished", percentage: 100 })];

      renderWithNuxt(FileUpload, {
        props: { ...defaultProps, fileList: files },
      });

      expect(screen.getByText("Uploaded")).toBeInTheDocument();
    });

    it("should show error message for a file with error status", () => {
      const files = [
        makeFileInfo({
          status: "error",
          errorMessage: "File type not accepted",
        }),
      ];

      renderWithNuxt(FileUpload, {
        props: { ...defaultProps, fileList: files },
      });

      expect(screen.getByText("File type not accepted")).toBeInTheDocument();
    });

    it("should show 'Ready' label for a pending file", () => {
      const files = [makeFileInfo({ status: "pending" })];

      renderWithNuxt(FileUpload, {
        props: { ...defaultProps, fileList: files },
      });

      expect(screen.getByText("Ready")).toBeInTheDocument();
    });

    it("should show a progress bar while uploading", () => {
      const files = [makeFileInfo({ status: "uploading", percentage: 60 })];

      renderWithNuxt(FileUpload, {
        props: { ...defaultProps, fileList: files },
      });

      const bar = document.querySelector('[style*="width: 60%"]');
      expect(bar).toBeInTheDocument();
    });

    it("should hide the remove button while a file is uploading", () => {
      const files = [makeFileInfo({ status: "uploading", percentage: 30 })];

      renderWithNuxt(FileUpload, {
        props: { ...defaultProps, fileList: files },
      });

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should hide the remove button when disabled prop is true", () => {
      const files = [makeFileInfo({ status: "finished" })];

      renderWithNuxt(FileUpload, {
        props: { ...defaultProps, fileList: files, disabled: true },
      });

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // File selection via input
  // -------------------------------------------------------------------------

  describe("file input", () => {
    it("should emit 'change' when files are selected via the input", async () => {
      const { emitted } = renderWithNuxt(FileUpload, {
        props: defaultProps,
      });

      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      Object.defineProperty(input, "files", {
        value: makeFileList([makeFile("photo.jpg", "image/jpeg")]),
      });

      await fireEvent.change(input);

      expect(emitted().change).toBeTruthy();
    });

    it("should reset the input value after selection so the same file can be re-selected", async () => {
      renderWithNuxt(FileUpload, { props: defaultProps });

      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      Object.defineProperty(input, "files", {
        value: makeFileList([makeFile()]),
      });

      await fireEvent.change(input);

      expect(input.value).toBe("");
    });

    it("should set multiple attribute when maxFiles > 1", () => {
      renderWithNuxt(FileUpload, {
        props: { ...defaultProps, maxFiles: 3 },
      });

      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      expect(input.multiple).toBe(true);
    });

    it("should do not set multiple attribute when maxFiles is 1", () => {
      renderWithNuxt(FileUpload, {
        props: { ...defaultProps, maxFiles: 1 },
      });

      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      expect(input.multiple).toBe(false);
    });

    it("should pass accept string to the native input", () => {
      renderWithNuxt(FileUpload, {
        props: { accept: ["image/png", "image/jpeg"] },
      });

      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      expect(input.accept).toBe("image/png,image/jpeg");
    });
  });

  // -------------------------------------------------------------------------
  // Drag & drop
  // -------------------------------------------------------------------------

  describe("drag and drop", () => {
    it("should emit 'change' when files are dropped onto the drop zone", async () => {
      const { emitted } = renderWithNuxt(FileUpload, {
        props: defaultProps,
      });

      const dropZone = screen.getByText(/upload a file here/i).closest("div")!;

      await fireEvent.drop(dropZone, {
        dataTransfer: {
          files: makeFileList([makeFile("dropped.txt")]),
        },
      });

      expect(emitted().change).toBeTruthy();
    });

    it("should do not process files when dropped while disabled", async () => {
      const { emitted } = renderWithNuxt(FileUpload, {
        props: { ...defaultProps, disabled: true },
      });

      const dropZone = screen.getByText(/upload a file here/i).closest("div")!;

      await fireEvent.drop(dropZone, {
        dataTransfer: { files: makeFileList([makeFile()]) },
      });

      expect(emitted().change).toBeFalsy();
    });
  });

  // -------------------------------------------------------------------------
  // Remove file
  // -------------------------------------------------------------------------

  describe("remove file", () => {
    it("should emit 'remove' and 'change' when the remove button is clicked", async () => {
      const files = [makeFileInfo({ id: "f-1", status: "finished" })];
      const { emitted } = renderWithNuxt(FileUpload, {
        props: { ...defaultProps, fileList: files },
      });

      await fireEvent.click(screen.getByRole("button"));

      expect(emitted().remove).toBeTruthy();
      expect(emitted().change).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Alt attribute input
  // -------------------------------------------------------------------------
  describe("alt attribute input", () => {
    it("should show an input field when a file is an image and withAltText is true", () => {
      const files = [
        makeFileInfo({
          name: "photo.jpg",
          type: "image/jpeg",
          file: makeFile("photo.jpg", "image/jpeg"),
        }),
      ];

      renderWithNuxt(FileUpload, {
        props: { ...defaultProps, fileList: files, withAltText: true },
      });

      expect(
        screen.getByPlaceholderText("Image description (alt text)"),
      ).toBeInTheDocument();
    });

    it("should emit 'change' when the alt text is updated", async () => {
      const files = [
        makeFileInfo({
          name: "photo.jpg",
          type: "image/jpeg",
          file: makeFile("photo.jpg", "image/jpeg"),
        }),
      ];

      const { emitted } = renderWithNuxt(FileUpload, {
        props: { ...defaultProps, fileList: files, withAltText: true },
      });

      await fireEvent.input(
        screen.getByPlaceholderText("Image description (alt text)"),
      );

      expect(emitted().change).toBeTruthy();
    });
  });
});
