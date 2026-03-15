import { vi } from "vitest";

type EventCallback = (...args: unknown[]) => void;

type ProgressEvent = {
  lengthComputable: boolean;
  loaded: number;
  total: number;
};

export function makeXhrMock() {
  const listeners: Record<string, EventCallback> = {};
  const uploadListeners: Record<string, EventCallback> = {};

  const xhr = {
    open: vi.fn(),
    send: vi.fn(),
    setRequestHeader: vi.fn(),
    withCredentials: false,
    status: 200,
    upload: {
      addEventListener: vi.fn((event: string, cb: EventCallback) => {
        uploadListeners[event] = cb;
      }),
    },
    addEventListener: vi.fn((event: string, cb: EventCallback) => {
      listeners[event] = cb;
    }),
    // Helpers - event simulation symulacja zdarzeń z zewnątrz testu
    simulateLoad: () => listeners["load"]?.(),
    simulateError: () => listeners["error"]?.(),
    simulateProgress: (loaded: number, total: number) =>
      uploadListeners["progress"]?.({
        lengthComputable: true,
        loaded,
        total,
      } satisfies ProgressEvent),
  };

  return xhr;
}
