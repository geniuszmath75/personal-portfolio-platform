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
     * (nofileList prop)
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
            ? props.accept
                  .map((type) => type.split("/")[1]?.toUpperCase())
                  .join(", ")
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
     * Generates a unique file identifier based on timestamp and random suffix.
     * @returns Unique string ID in the format "file-{timestamp}-{random}"
     */
    function generateId(): string {
        return `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

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
            id: generateId(),
            name: file.name,
            file,
            status: "pending",
            percentage: null,
            url: null,
            thumbnailUrl: isImage ? URL.createObjectURL(file) : null,
            type: file.type || null,
            errorMessage: null,
        };
    }

    /**
     * Applies a partial update to a single file entry identified by ID.
     * Handles both controlled and uncontrolled modes.
     *
     * @param id - target file ID
     * @param patch - partial UploadFileInfo fields to merge
     */
    function updateFile(id: string, patch: Partial<UploadFileInfo>) {
        const list = files.value.map((f) =>
            f.id === id ? { ...f, ...patch } : f,
        );
        if (props.fileList !== undefined) {
            callbacks.onUpdateFileList(list);
        } else {
            internalFiles.value = list;
        }
    }

    /**
     * Appends new file entries to the active list and emits change.
     * Handles both controlled and uncontrolled modes.
     *
     * @param newFiles - file entries to append
     */
    function addFiles(newFiles: UploadFileInfo[]) {
        const list = [...files.value, ...newFiles];
        if (props.fileList !== undefined) {
            callbacks.onUpdateFileList(list);
        } else {
            internalFiles.value = list;
        }
        callbacks.onChange(list);
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
                    return file.name
                        .toLowerCase()
                        .endsWith(pattern.toLowerCase());
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
     * Initiates the upload for a single file entry.
     * Delegates to customRequest if provided, falls back to XHR against action URL.
     * If neither is configured, file remains in 'pending' status (manual submit mode).
     *
     * @param fileInfo - the file entry to upload
     */
    function uploadFile(fileInfo: UploadFileInfo) {
        if (!fileInfo.file) return;

        updateFile(fileInfo.id, { status: "uploading", percentage: 0 });

        if (props.customRequest) {
            props.customRequest({
                file: fileInfo,
                onProgress: (percent) =>
                    updateFile(fileInfo.id, { percentage: percent }),
                onFinish: (url) => {
                    const updated = {
                        status: "finished" as UploadFileStatus,
                        percentage: 100,
                        url: url ?? null,
                    };
                    updateFile(fileInfo.id, updated);
                    callbacks.onFinish({ ...fileInfo, ...updated });
                },
                onError: (message) => {
                    const updated = {
                        status: "error" as UploadFileStatus,
                        errorMessages: message ?? "Upload failed",
                    };
                    updateFile(fileInfo.id, updated);
                    callbacks.onError({ ...fileInfo, ...updated });
                },
            });
            return;
        }

        if (!props.action) {
            // No transport configured - leave as pending for manual submit
            updateFile(fileInfo.id, { status: "pending" });
            return;
        }

        // --- Native XHR upload ---
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append("file", fileInfo.file);
        Object.entries(props.data).forEach(([k, v]) => formData.append(k, v));

        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
                updateFile(fileInfo.id, {
                    percentage: Math.round((e.loaded / e.total) * 100),
                });
            }
        });

        xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const updated = {
                    status: "finished" as UploadFileStatus,
                    percentage: 100,
                };
                updateFile(fileInfo.id, updated);
                callbacks.onFinish({ ...fileInfo, ...updated });
            } else {
                const updated = {
                    status: "error" as UploadFileStatus,
                    errorMessages: `Server error: ${xhr.status}`,
                };
                updateFile(fileInfo.id, updated);
                callbacks.onError({ ...fileInfo, ...updated });
            }
        });

        xhr.addEventListener("error", () => {
            const updated = {
                status: "error" as UploadFileStatus,
                errorMessage: "Network error",
            };
            updateFile(fileInfo.id, updated);
            callbacks.onError({ ...fileInfo, ...updated });
        });

        xhr.open("POST", props.action);
        xhr.withCredentials = props.withCredentials;
        Object.entries(props.headers).forEach(([k, v]) =>
            xhr.setRequestHeader(k, v),
        );
        xhr.send(formData);
    }

    /**
     * Processes a FileList from either a drop or input change event.
     * Validates each file, builds UploadFileInfo entries, and starts uploads.
     *
     * @param raw - native FileList or null
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
                    error
                        ? { ...info, status: "error", errorMessage: error }
                        : info,
                );
            });

        addFiles(toAdd);

        // Start upload only for files that passed validation
        toAdd.filter((f) => f.status === "pending").forEach(uploadFile);
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
     * Retry a failed upload for the given file ID
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
            updateFile(id, reset);
            uploadFile({
                ...fileInfo,
                ...reset,
            });
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
     * Return only successfully uploaded files
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
