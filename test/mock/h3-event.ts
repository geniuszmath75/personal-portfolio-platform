import type { H3Event } from "h3";
import { merge } from "lodash";

export const createMockH3Event = (
  partialEvent: Partial<H3Event> & {
    body?: Record<string, unknown>;
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
  },
): H3Event => {
  const event = {
    node: {
      req: {
        headers: { "content-type": "application/json" },
        method: "POST",
      },
    },
    context: {
      params: partialEvent.params || {},
      query: partialEvent.query || {},
    },

    _requestBody: partialEvent.body,
  } as unknown as H3Event;

  return merge(event, partialEvent) as H3Event;
};
