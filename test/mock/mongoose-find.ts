import type { Model } from "mongoose";
import { vi } from "vitest";

/**
 * Creates a mocked Mongoose `find().skip().limit()` chain for
 * testing.
 *
 * @param result- The final value returned when `limit()` is
 * resolved.
 * @param model- The Mongoose model whose `find` method should be
 * mocked.
 * @returns The mocked functions (find, skip, limit) for assertions in tests.
 */
export function createMockFindChain<T>(result: unknown, model: Model<T>) {
  const limitMock = vi.fn().mockResolvedValue(result);
  const skipMock = vi.fn().mockReturnValue({ limit: limitMock });
  const findMock = vi.fn().mockReturnValue({ skip: skipMock });

  vi.mocked(model.find).mockImplementation(findMock);
  return { findMock, skipMock, limitMock };
}
