import type {
  FileUploadComposableProps,
  UploadFileInfo,
  UploadFileStatus,
} from "~/types/components";

export function useFileUpload(
  props: FileUploadComposableProps,
  callbacks: {
    onUpdateFileList: (files: UploadFileInfo[]) => void;
    onChange: (files: UploadFileInfo[]) => void;
    onFinish: (file: UploadFileInfo) => void;
    onError: (file: UploadFileInfo) => void;
    onRemove: (file: UploadFileInfo) => void;
  },
) {
  /****************
   * INTERNAL STATE
   ***************/

  /**
   * Internal file list used when component operates in uncontrolled mode
   * (no fileList prop).
   */
  const internalFiles = ref<UploadFileInfo[]>([]);

  /**
   * Resolves the active file list – controlled (prop) or uncontrolled (internal)
   */
  const files = computed<UploadFileInfo[]>(() =>
    props.fileList !== undefined ? props.fileList : internalFiles.value,
  );

  /******************
   * COMPUTED HELPERS
   *****************/

  /**
   * True when the component should reject new interactions -
   * either explicitly disabled or the file limit has been reached.
   */
  const isDisabled = computed(
    () => props.disabled || files.value.length >= props.maxFiles,
  );

  /**
   * Comma-separated accept string passed directly to the native file input
   */
  const acceptString = computed(() => props.accept.join(","));

  /**
   * Human-readable max size label
   */
  const maxSizeLabel = computed(() => `${props.maxSizeMB} MB`);

  /**
   * Human-readable list of accepted file types derived from MIME types.
   * e.g. ['image/jpeg', 'image/png'] → "JPEG, PNG"
   */
  const acceptLabel = computed(() =>
    props.accept.length
      ? props.accept.map((type) => type.split("/")[1]?.toUpperCase()).join(", ")
      : "All file types",
  );

  /**
   * Controls drop zone visibility – hidden once the file limit is reached.
   */
  const dropZoneVisible = computed(() => files.value.length < props.maxFiles);

  /*********
   * HELPERS
   ********/

  /**
   * Formats a byte count into a human-readable string (B / KB / MB).
   * @param bytes - raw file size in bytes
   */
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Constructs an UploadFileInfo object from a native File.
   * Automatically generates a thumbnail URL for image files.
   * @param file - native file object selected by the user
   */
  function buildFileInfo(file: File): UploadFileInfo {
    const isImage = file.type.startsWith("image/");
    return {
      id: crypto.randomUUID(),
      name: file.name,
      file,
      status: "pending",
      percentage: null,
      url: null,
      thumbnailUrl: isImage ? URL.createObjectURL(file) : null,
      type: file.type || null,
      errorMessage: null,
      altText: "",
    };
  }

  /**
   * Applies a partial update to a single file entry identified by ID.
   * Handles both controlled and uncontrolled modes.
   *
   * In controlled mode, pass baseList when props.fileList may still be stale
   * (e.g. immediately after addFiles). Returns the updated list for chaining
   * in async upload callbacks.
   *
   * @param id - target file ID
   * @param patch - partial UploadFileInfo fields to merge
   * @param baseList - list to patch instead of files.value (controlled mode)
   * @returns the updated file list after the patch is applied
   */
  function updateFile(
    id: string,
    patch: Partial<UploadFileInfo>,
    baseList?: UploadFileInfo[],
  ): UploadFileInfo[] {
    const source = baseList ?? files.value;
    const list = source.map((f) => (f.id === id ? { ...f, ...patch } : f));

    if (props.fileList !== undefined) {
      callbacks.onUpdateFileList(list);
    } else {
      internalFiles.value = list;
    }

    return list;
  }

  /**
   * Appends new file entries to the active list and emits change.
   * Handles both controlled and uncontrolled modes.
   *
   * @param newFiles - file entries to append
   * @returns the list after append (parent must sync fileList in controlled mode)
   */
  function addFiles(newFiles: UploadFileInfo[]): UploadFileInfo[] {
    const list = [...files.value, ...newFiles];

    if (props.fileList !== undefined) {
      callbacks.onUpdateFileList(list);
    } else {
      internalFiles.value = list;
    }

    callbacks.onChange(list);
    return list;
  }

  /************
   * VALIDATION
   ***********/

  /**
   * Validates a native File against size and type constraints from props.
   *
   * @param file - File to validate
   * @returns Error message string or null if valid
   */
  function validate(file: File): string | null {
    const maxSizeInBytes = props.maxSizeMB * 1024 * 1024;

    if (props.maxSizeMB > 0 && file.size > maxSizeInBytes) {
      return `File exceeds max size of ${maxSizeLabel.value}`;
    }

    if (props.accept.length) {
      const accepted = props.accept.some((pattern) => {
        if (pattern.endsWith("/*")) {
          // Wildcard MIME match e.g. "image/*"
          return file.type.startsWith(pattern.replace("/*", "/"));
        }
        if (pattern.startsWith(".")) {
          // Extension match e.g. ".pdf"
          return file.name.toLowerCase().endsWith(pattern.toLowerCase());
        }
        // Exact MIME type match e.g. "image/jpeg"
        return file.type === pattern;
      });

      if (!accepted) return "File type not accepted";
    }
    return null;
  }

  /**************
   * UPLOAD LOGIC
   *************/

  /**
   * Initiates the upload lifecycle for a single file entry.
   * No-op when neither action nor customRequest is configured — in that case
   * the file stays "pending" as set by addFiles (manual submit mode).
   *
   * Delegates to customRequest if provided, otherwise uses XHR against action URL.
   *
   * @param fileInfo - the file entry to upload
   * @param baseList - list from addFiles to avoid stale props.fileList in controlled mode
   */
  function uploadFile(fileInfo: UploadFileInfo, baseList?: UploadFileInfo[]) {
    if (!fileInfo.file) return;

    if (!props.action && !props.customRequest) {
      return;
    }

    let currentList = updateFile(
      fileInfo.id,
      { status: "uploading", percentage: 0 },
      baseList,
    );

    if (props.customRequest) {
      props.customRequest({
        file: fileInfo,
        onProgress: (percent) =>
          (currentList = updateFile(
            fileInfo.id,
            { percentage: percent },
            currentList,
          )),
        onFinish: (url) => {
          const updated = {
            status: "finished" as UploadFileStatus,
            percentage: 100,
            url: url ?? null,
          };
          currentList = updateFile(fileInfo.id, updated, currentList);
          callbacks.onFinish({ ...fileInfo, ...updated });
        },
        onError: (message) => {
          const updated = {
            status: "error" as UploadFileStatus,
            errorMessage: message ?? "Upload failed",
          };
          currentList = updateFile(fileInfo.id, updated, currentList);
          callbacks.onError({ ...fileInfo, ...updated });
        },
      });
      return;
    }

    // --- Native XHR upload ---
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", fileInfo.file);
    Object.entries(props.data).forEach(([k, v]) => formData.append(k, v));

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        currentList = updateFile(
          fileInfo.id,
          {
            percentage: Math.round((e.loaded / e.total) * 100),
          },
          currentList,
        );
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const updated = {
          status: "finished" as UploadFileStatus,
          percentage: 100,
        };
        currentList = updateFile(fileInfo.id, updated, currentList);
        callbacks.onFinish({ ...fileInfo, ...updated });
      } else {
        const updated = {
          status: "error" as UploadFileStatus,
          errorMessage: `Server error: ${xhr.status}`,
        };
        currentList = updateFile(fileInfo.id, updated, currentList);
        callbacks.onError({ ...fileInfo, ...updated });
      }
    });

    xhr.addEventListener("error", () => {
      const updated = {
        status: "error" as UploadFileStatus,
        errorMessage: "Network error",
      };
      currentList = updateFile(fileInfo.id, updated, currentList);
      callbacks.onError({ ...fileInfo, ...updated });
    });

    const action = props.action;
    if (!action) return;

    xhr.open("POST", action);
    xhr.withCredentials = props.withCredentials;
    Object.entries(props.headers).forEach(([k, v]) =>
      xhr.setRequestHeader(k, v),
    );
    xhr.send(formData);
  }

  /**
   * Processes a FileList from either a drop or input change event.
   * Validates each file, builds UploadFileInfo entries, appends via addFiles,
   * then starts uploadFile for pending entries when a transport is configured.
   *
   * @param raw - native FileList or null
   * @returns the list after addFiles, or undefined when nothing was processed
   */
  function processFiles(raw: FileList | null) {
    if (!raw || isDisabled.value) return;

    // Guard against negative remaining count if fileList was set programmatically
    const remaining = Math.max(0, props.maxFiles - files.value.length);
    const toAdd: UploadFileInfo[] = [];

    Array.from(raw)
      .slice(0, remaining)
      .forEach((file) => {
        const error = validate(file);
        const info = buildFileInfo(file);
        toAdd.push(
          error ? { ...info, status: "error", errorMessage: error } : info,
        );
      });

    const list = addFiles(toAdd);

    // Start upload only for files that passed validation
    toAdd
      .filter((f) => f.status === "pending")
      .forEach((f) => uploadFile(f, list));

    return list;
  }

  /**
   * Removes a file entry from the list and revokes its thumbnail URL if present.
   * Handles both controlled and uncontrolled modes.
   *
   * @param id - ID of the file entry to remove
   */
  function removeFile(id: string) {
    const fileInfo = files.value.find((f) => f.id === id);
    if (!fileInfo) return;

    // Revoke object URL to free memory
    if (fileInfo.thumbnailUrl) {
      URL.revokeObjectURL(fileInfo.thumbnailUrl);
    }

    const list = files.value.filter((f) => f.id !== id);
    if (props.fileList !== undefined) {
      callbacks.onUpdateFileList(list);
    } else {
      internalFiles.value = list;
    }
    callbacks.onRemove(fileInfo);
    callbacks.onChange(list);
  }

  /*****************
   * EXPOSED METHODS
   ****************/

  /**
   * Retry a failed upload for the given file ID.
   * Resets the entry to pending and re-runs uploadFile when a transport is configured.
   *
   * @param id - ID of the file entry to retry
   */
  function retry(id: string) {
    const fileInfo = files.value.find((f) => f.id === id);
    if (fileInfo?.status === "error" && fileInfo.file) {
      const reset = {
        status: "pending" as UploadFileStatus,
        percentage: null,
        errorMessage: null,
      };
      const list = updateFile(id, reset);
      uploadFile(
        {
          ...fileInfo,
          ...reset,
        },
        list,
      );
    }
  }

  /**
   * Removes all file entries and revokes all thumbnail URLs.
   */
  function clear() {
    files.value.forEach((f) => {
      if (f.thumbnailUrl) URL.revokeObjectURL(f.thumbnailUrl);
    });
    if (props.fileList !== undefined) {
      callbacks.onUpdateFileList([]);
    } else {
      internalFiles.value = [];
    }
  }

  /**
   * Return entries with status "finished" (uploaded or pre-existing from server).
   */
  function getFinishedFiles(): UploadFileInfo[] {
    return files.value.filter((f) => f.status === "finished");
  }

  return {
    files,
    isDisabled,
    acceptString,
    maxSizeLabel,
    acceptLabel,
    dropZoneVisible,
    formatFileSize,
    processFiles,
    removeFile,
    retry,
    clear,
    getFinishedFiles,
  };
}
