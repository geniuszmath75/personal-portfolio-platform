import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "vue-composable-tester";
import { useFileUpload } from "~/composables/useFileUpload";
import type {
  CustomRequestHandler,
  FileUploadComposableProps,
  UploadFileInfo,
} from "~/types/components";
import { makeXhrMock } from "~~/test/mock/xhr";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Creates a minimal native File mock */
function makeFile(
  name = "test.txt",
  type = "text/plain",
  sizeBytes = 1024,
): File {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type });
  return new File([blob], name, { type });
}

/** Builds a FileList-like object from an array of Files */
function makeFileList(files: File[]): FileList {
  const dt = new DataTransfer();
  files.forEach((f) => dt.items.add(f));
  return dt.files;
}

/** Default composable props – all required fields with sensible defaults */
function makeProps(
  overrides: Partial<FileUploadComposableProps> = {},
): FileUploadComposableProps {
  return {
    accept: [],
    maxFiles: 5,
    maxSizeMB: 10,
    disabled: false,
    data: {},
    headers: {},
    withCredentials: false,
    ...overrides,
  };
}

/** Default no-op callbacks */
function makeCallbacks() {
  return {
    onUpdateFileList: vi.fn(),
    onChange: vi.fn(),
    onFinish: vi.fn(),
    onError: vi.fn(),
    onRemove: vi.fn(),
  };
}

// ---------------------------------------------------------------------------
// URL mock (jsdom doesn't implement createObjectURL / revokeObjectURL)
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:mock-url"),
      revokeObjectURL: vi.fn(),
    }),
  );
});

describe("useFileUpload", () => {
  // -------------------------------------------------------------------------
  // Computed helpers
  // -------------------------------------------------------------------------
  describe("acceptString", () => {
    it("should join accepted MIME types with commas", () => {
      const { result } = mount(() =>
        useFileUpload(
          makeProps({ accept: ["image/jpeg", "image/png"] }),
          makeCallbacks(),
        ),
      );
      expect(result.acceptString.value).toBe("image/jpeg,image/png");
    });
  });

  describe("maxSizeLabel", () => {
    it("should format the max size as '<n> MB'", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps({ maxSizeMB: 25 }), makeCallbacks()),
      );
      expect(result.maxSizeLabel.value).toBe("25 MB");
    });
  });

  describe("acceptLabel", () => {
    it("should return uppercase extension labels for MIME types", () => {
      const { result } = mount(() =>
        useFileUpload(
          makeProps({ accept: ["image/jpeg", "image/png"] }),
          makeCallbacks(),
        ),
      );
      expect(result.acceptLabel.value).toBe("JPEG, PNG");
    });

    it("should return 'All file types' when accept is empty", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps({ accept: [] }), makeCallbacks()),
      );
      expect(result.acceptLabel.value).toBe("All file types");
    });
  });

  describe("isDisabled", () => {
    it("should be true when disabled prop is true", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps({ disabled: true }), makeCallbacks()),
      );
      expect(result.isDisabled.value).toBe(true);
    });

    it("should be true when file limit is reached (uncontrolled)", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps({ maxFiles: 1 }), makeCallbacks()),
      );
      result.processFiles(makeFileList([makeFile()]));
      expect(result.isDisabled.value).toBe(true);
    });
  });

  describe("dropZoneVisible", () => {
    it("should be false once file limit is reached", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps({ maxFiles: 1 }), makeCallbacks()),
      );
      result.processFiles(makeFileList([makeFile()]));
      expect(result.dropZoneVisible.value).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // formatFileSize
  // -------------------------------------------------------------------------

  describe("formatFileSize", () => {
    it("should format bytes", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps(), makeCallbacks()),
      );
      expect(result.formatFileSize(512)).toBe("512 B");
    });

    it("should format kilobytes", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps(), makeCallbacks()),
      );
      expect(result.formatFileSize(2048)).toBe("2.0 KB");
    });

    it("should format megabytes", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps(), makeCallbacks()),
      );
      expect(result.formatFileSize(3 * 1024 * 1024)).toBe("3.0 MB");
    });
  });

  // -------------------------------------------------------------------------
  // processFiles – uncontrolled mode
  // -------------------------------------------------------------------------

  describe("processFiles (uncontrolled)", () => {
    it("should add a valid file to the list", () => {
      const callbacks = makeCallbacks();
      const { result } = mount(() => useFileUpload(makeProps(), callbacks));

      result.processFiles(makeFileList([makeFile("doc.txt")]));

      expect(result.files.value).toHaveLength(1);
      expect(result.files.value[0]!.name).toBe("doc.txt");
      expect(result.files.value[0]!.status).toBe("pending");
    });

    it("should do nothing when isDisabled is true", () => {
      const callbacks = makeCallbacks();
      const { result } = mount(() =>
        useFileUpload(makeProps({ disabled: true }), callbacks),
      );

      result.processFiles(makeFileList([makeFile()]));
      expect(result.files.value).toHaveLength(0);
      expect(callbacks.onChange).not.toHaveBeenCalled();
    });

    it("should respect maxFiles – does not exceed the limit", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps({ maxFiles: 2 }), makeCallbacks()),
      );

      result.processFiles(
        makeFileList([makeFile("a.txt"), makeFile("b.txt"), makeFile("c.txt")]),
      );
      expect(result.files.value).toHaveLength(2);
    });

    it("should mark file as error when it fails size validation", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps({ maxSizeMB: 1 }), makeCallbacks()),
      );

      const oversized = makeFile(
        "big.bin",
        "application/octet-stream",
        2 * 1024 * 1024,
      );
      result.processFiles(makeFileList([oversized]));

      expect(result.files.value[0]!.status).toBe("error");
      expect(result.files.value[0]!.errorMessage).toContain("1 MB");
    });

    it("should mark file as error when type is not accepted", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps({ accept: ["image/png"] }), makeCallbacks()),
      );

      result.processFiles(makeFileList([makeFile("doc.txt", "text/plain")]));

      expect(result.files.value[0]!.status).toBe("error");
      expect(result.files.value[0]!.errorMessage).toBe(
        "File type not accepted",
      );
    });

    it("should accept files matching a wildcard MIME pattern", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps({ accept: ["image/*"] }), makeCallbacks()),
      );

      result.processFiles(makeFileList([makeFile("photo.jpg", "image/jpeg")]));
      expect(result.files.value[0]!.status).toBe("pending");
    });

    it("should accept files matching an extension pattern", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps({ accept: [".pdf"] }), makeCallbacks()),
      );

      result.processFiles(
        makeFileList([makeFile("report.pdf", "application/pdf")]),
      );
      expect(result.files.value[0]!.status).toBe("pending");
    });

    it("should generate a thumbnailUrl for image files", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps(), makeCallbacks()),
      );

      result.processFiles(makeFileList([makeFile("img.jpg", "image/jpeg")]));
      expect(result.files.value[0]!.thumbnailUrl).toBe("blob:mock-url");
    });

    it("should leave thumbnailUrl null for non-image files", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps(), makeCallbacks()),
      );

      result.processFiles(
        makeFileList([makeFile("doc.pdf", "application/pdf")]),
      );
      expect(result.files.value[0]!.thumbnailUrl).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // processFiles – controlled mode
  // -------------------------------------------------------------------------

  describe("processFiles (controlled)", () => {
    it("should call onUpdateFileList instead of mutating internal state", () => {
      const callbacks = makeCallbacks();

      const { result } = mount(() =>
        useFileUpload(makeProps({ fileList: [] }), callbacks),
      );

      result.processFiles(makeFileList([makeFile()]));

      expect(callbacks.onUpdateFileList).toHaveBeenCalled();
      expect(result.files.value).toHaveLength(0);
    });

    it("should return list from processFiles", () => {
      const callbacks = makeCallbacks();

      const { result } = mount(() =>
        useFileUpload(makeProps({ fileList: [] }), callbacks),
      );

      const list = result.processFiles(makeFileList([makeFile("doc.txt")]));

      expect(list).toHaveLength(1);
      expect(list![0]).toMatchObject({
        name: "doc.txt",
        status: "pending",
      });
    });

    it("should emit a single onUpdateFileList call in manual submit mode", () => {
      const callbacks = makeCallbacks();

      const { result } = mount(() =>
        useFileUpload(makeProps({ fileList: [] }), callbacks),
      );

      result.processFiles(makeFileList([makeFile()]));

      expect(callbacks.onUpdateFileList).toHaveBeenCalledTimes(1);
      expect(callbacks.onUpdateFileList).toHaveBeenCalledWith([
        expect.objectContaining({ status: "pending" }),
      ]);
    });

    it("should chain upload updates from addFiles baseList without wiping the list", () => {
      const customRequest = vi.fn();
      const callbacks = makeCallbacks();

      const { result } = mount(() =>
        useFileUpload(makeProps({ fileList: [], customRequest }), callbacks),
      );

      result.processFiles(makeFileList([makeFile()]));

      const updateCalls = callbacks.onUpdateFileList.mock.calls.map(
        (call) => call[0] as UploadFileInfo[],
      );

      expect(updateCalls.length).toBeGreaterThanOrEqual(2);
      expect(updateCalls[0]).toHaveLength(1);
      expect(updateCalls[0]![0]!.status).toBe("pending");
      expect(updateCalls[1]![0]!.status).toBe("uploading");
      updateCalls.forEach((list) => expect(list).toHaveLength(1));
    });
  });

  // -------------------------------------------------------------------------
  // removeFile
  // -------------------------------------------------------------------------

  describe("removeFile", () => {
    it("should remove a file by id", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps(), makeCallbacks()),
      );

      result.processFiles(makeFileList([makeFile("a.txt")]));
      const id = result.files.value[0]!.id;

      result.removeFile(id);
      expect(result.files.value).toHaveLength(0);
    });

    it("should call onRemove and onChange callbacks", () => {
      const callbacks = makeCallbacks();
      const { result } = mount(() => useFileUpload(makeProps(), callbacks));

      result.processFiles(makeFileList([makeFile()]));
      const id = result.files.value[0]!.id;
      callbacks.onChange.mockClear();

      result.removeFile(id);
      expect(callbacks.onRemove).toHaveBeenCalledWith(
        expect.objectContaining({ id }),
      );
      expect(callbacks.onChange).toHaveBeenCalledWith([]);
    });

    it("should revoke thumbnailUrl when removing an image file", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps(), makeCallbacks()),
      );

      result.processFiles(makeFileList([makeFile("img.png", "image/png")]));
      const id = result.files.value[0]!.id;

      result.removeFile(id);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("should do nothing for an unknown id", () => {
      const callbacks = makeCallbacks();
      const { result } = mount(() => useFileUpload(makeProps(), callbacks));

      result.removeFile("non-existent-id");
      expect(callbacks.onRemove).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // clear
  // -------------------------------------------------------------------------

  describe("clear", () => {
    it("should remove all files from the list", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps(), makeCallbacks()),
      );

      result.processFiles(makeFileList([makeFile("a.txt"), makeFile("b.txt")]));
      expect(result.files.value).toHaveLength(2);

      result.clear();
      expect(result.files.value).toHaveLength(0);
    });

    it("should revoke thumbnailUrls for all image files", () => {
      const { result } = mount(() =>
        useFileUpload(makeProps(), makeCallbacks()),
      );

      result.processFiles(makeFileList([makeFile("img.png", "image/png")]));
      result.clear();

      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("should call onUpdateFileList([]) in controlled mode", () => {
      const callbacks = makeCallbacks();
      const { result } = mount(() =>
        useFileUpload(makeProps({ fileList: [] }), callbacks),
      );

      result.clear();
      expect(callbacks.onUpdateFileList).toHaveBeenCalledWith([]);
    });
  });

  // -------------------------------------------------------------------------
  // getFinishedFiles
  // -------------------------------------------------------------------------

  describe("getFinishedFiles", () => {
    it("should return only files with status 'finished'", () => {
      const callbacks = makeCallbacks();

      // Simulate two files – one finished, one pending
      const finishedFile: UploadFileInfo = {
        id: "f-1",
        name: "done.txt",
        file: makeFile("done.txt"),
        status: "finished",
        percentage: 100,
        url: "https://cdn.example.com/done.txt",
        thumbnailUrl: null,
        type: "text/plain",
        errorMessage: null,
        altText: "",
      };
      const pendingFile: UploadFileInfo = {
        id: "f-2",
        name: "pending.txt",
        file: makeFile("pending.txt"),
        status: "pending",
        percentage: null,
        url: null,
        thumbnailUrl: null,
        type: "text/plain",
        errorMessage: null,
        altText: "",
      };

      // Bypass processFiles by using controlled mode
      const { result: controlled } = mount(() =>
        useFileUpload(
          makeProps({ fileList: [finishedFile, pendingFile] }),
          callbacks,
        ),
      );

      const finished = controlled.getFinishedFiles();
      expect(finished).toHaveLength(1);
      expect(finished[0]!.id).toBe("f-1");
    });
  });

  // -------------------------------------------------------------------------
  // retry
  // -------------------------------------------------------------------------

  describe("retry", () => {
    it("should reset an errored file back to pending and re-attempts upload via customRequest", () => {
      const customRequest = vi.fn();
      const { result } = mount(() =>
        useFileUpload(makeProps({ customRequest }), makeCallbacks()),
      );

      result.processFiles(
        makeFileList([makeFile("fail.pdf", "application/pdf")]),
      );
      const id = result.files.value[0]!.id;

      // Simulate error by triggering onError inside customRequest call
      const firstCall = customRequest.mock.calls[0]![0];
      firstCall.onError("Upload failed");

      expect(result.files.value.find((f) => f.id === id)?.status).toBe("error");

      customRequest.mockClear();
      result.retry(id);

      expect(customRequest).toHaveBeenCalledTimes(1);
    });

    it("should do nothing for a file that is not in error state", () => {
      const customRequest = vi.fn();
      const { result } = mount(() =>
        useFileUpload(makeProps({ customRequest }), makeCallbacks()),
      );

      result.processFiles(makeFileList([makeFile()]));
      const id = result.files.value[0]!.id;
      customRequest.mockClear();

      result.retry(id); // still pending, not error
      expect(customRequest).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Upload logic – customRequest
  // -------------------------------------------------------------------------

  describe("upload via customRequest", () => {
    it("should set status to 'uploading' then 'finished' on success", () => {
      let capturedHandlers!: Parameters<CustomRequestHandler>[0];
      const customRequest = vi.fn((opts) => {
        capturedHandlers = opts;
      });

      const { result } = mount(() =>
        useFileUpload(makeProps({ customRequest }), makeCallbacks()),
      );

      result.processFiles(makeFileList([makeFile()]));
      const id = result.files.value[0]!.id;

      expect(result.files.value.find((f) => f.id === id)?.status).toBe(
        "uploading",
      );

      capturedHandlers.onFinish("https://cdn.example.com/file.txt");

      const file = result.files.value.find((f) => f.id === id);
      expect(file?.status).toBe("finished");
      expect(file?.url).toBe("https://cdn.example.com/file.txt");
      expect(file?.percentage).toBe(100);
    });

    it("should set status to 'error' and calls onError on failure", () => {
      let capturedHandlers!: Parameters<CustomRequestHandler>[0];
      const customRequest = vi.fn((opts) => {
        capturedHandlers = opts;
      });
      const callbacks = makeCallbacks();

      const { result } = mount(() =>
        useFileUpload(makeProps({ customRequest }), callbacks),
      );

      result.processFiles(makeFileList([makeFile()]));
      capturedHandlers.onError("Something went wrong");

      expect(callbacks.onError).toHaveBeenCalledWith(
        expect.objectContaining({ status: "error" }),
      );
    });

    it("should update progress percentage via onProgress", () => {
      let capturedHandlers!: Parameters<CustomRequestHandler>[0];
      const customRequest = vi.fn((opts) => {
        capturedHandlers = opts;
      });

      const { result } = mount(() =>
        useFileUpload(makeProps({ customRequest }), makeCallbacks()),
      );

      result.processFiles(makeFileList([makeFile()]));
      const id = result.files.value[0]!.id;

      capturedHandlers.onProgress(42);
      expect(result.files.value.find((f) => f.id === id)?.percentage).toBe(42);
    });
  });

  describe("upload via XHR (action)", () => {
    let xhrMock: ReturnType<typeof makeXhrMock>;

    beforeEach(() => {
      xhrMock = makeXhrMock();
      // Vitest 4 treats `new` as a real constructor call — arrow implementations
      // throw "is not a constructor". A function that returns the mock instance works.
      vi.stubGlobal(
        "XMLHttpRequest",
        vi.fn(function XMLHttpRequest() {
          return xhrMock;
        }),
      );
    });

    it("should open POST request to the provided action URL", () => {
      const { result } = mount(() =>
        useFileUpload(
          makeProps({ action: "https://api.example.com/upload" }),
          makeCallbacks(),
        ),
      );

      result.processFiles(makeFileList([makeFile()]));
      expect(xhrMock.open).toHaveBeenCalledWith(
        "POST",
        "https://api.example.com/upload",
      );
    });

    it("should set withCredentials from props", () => {
      const { result } = mount(() =>
        useFileUpload(
          makeProps({
            action: "https://api.example.com/upload",
            withCredentials: true,
          }),
          makeCallbacks(),
        ),
      );

      result.processFiles(makeFileList([makeFile()]));
      expect(xhrMock.withCredentials).toBe(true);
    });

    it("should set HTTP headers from props", () => {
      const { result } = mount(() =>
        useFileUpload(
          makeProps({
            action: "https://api.example.com/upload",
            headers: { Authorization: "Bearer token" },
          }),
          makeCallbacks(),
        ),
      );

      result.processFiles(makeFileList([makeFile()]));
      expect(xhrMock.setRequestHeader).toHaveBeenCalledWith(
        "Authorization",
        "Bearer token",
      );
    });

    it("should set status to 'finished' after 2xx response", () => {
      const { result } = mount(() =>
        useFileUpload(
          makeProps({ action: "https://api.example.com/upload" }),
          makeCallbacks(),
        ),
      );

      result.processFiles(makeFileList([makeFile()]));
      xhrMock.status = 200;
      xhrMock.simulateLoad();

      expect(result.files.value[0]!.status).toBe("finished");
      expect(result.files.value[0]!.percentage).toBe(100);
    });

    it("should set status to 'error' after non-2xx response", () => {
      const callbacks = makeCallbacks();
      const { result } = mount(() =>
        useFileUpload(
          makeProps({ action: "https://api.example.com/upload" }),
          callbacks,
        ),
      );

      result.processFiles(makeFileList([makeFile()]));
      xhrMock.status = 500;
      xhrMock.simulateLoad();

      expect(result.files.value[0]!.status).toBe("error");
      expect(callbacks.onError).toHaveBeenCalled();
    });

    it("should set status to 'error' on network failure", () => {
      const callbacks = makeCallbacks();
      const { result } = mount(() =>
        useFileUpload(
          makeProps({ action: "https://api.example.com/upload" }),
          callbacks,
        ),
      );

      result.processFiles(makeFileList([makeFile()]));
      xhrMock.simulateError();

      expect(result.files.value[0]!.status).toBe("error");
      expect(callbacks.onError).toHaveBeenCalled();
    });

    it("should update percentage during upload progress", () => {
      const { result } = mount(() =>
        useFileUpload(
          makeProps({ action: "https://api.example.com/upload" }),
          makeCallbacks(),
        ),
      );

      result.processFiles(makeFileList([makeFile()]));
      xhrMock.simulateProgress(50, 100);

      expect(result.files.value[0]!.percentage).toBe(50);
    });
  });

  // -------------------------------------------------------------------------
  // Upload logic – no transport (manual submit mode)
  // -------------------------------------------------------------------------

  describe("upload with no transport configured", () => {
    it("should keep file in pending state when neither action nor customRequest is set", () => {
      const callbacks = makeCallbacks();
      const { result } = mount(() => useFileUpload(makeProps(), callbacks));

      result.processFiles(makeFileList([makeFile()]));

      expect(result.files.value[0]!.status).toBe("pending");
      expect(callbacks.onUpdateFileList).not.toHaveBeenCalled();
    });
  });
});
