import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QueryObject } from "ufo";
import {
  getPaginationObject,
  getPaginationParams,
} from "../../../../server/utils/pagination";
import type { IProject } from "../../../../shared/types/index";
import type { Model } from "mongoose";

describe("pagination util", () => {
  describe("getPaginationParams", () => {
    it("should return valid values for correct query", () => {
      // Arrange: provide query with valid numeric strings
      const query: QueryObject = { page: "3", limit: "5" };

      // Act: call helper to parse query into pagination parameters
      const result = getPaginationParams(query);

      // Assert: result contains expected values including skip calculation
      expect(result).toEqual({ page: 3, limit: 5, skip: 10 });
    });

    it("should set default values when query is empty", () => {
      // Arrange: empty query object
      const query: QueryObject = {};

      // Act: call helper to get pagination with defaults
      const result = getPaginationParams(query);

      // Assert: defaults are applied (page=1, limit=5, skip=0)
      expect(result).toEqual({ page: 1, limit: 5, skip: 0 });
    });

    it("should throw 400 for invalid 'page' value", () => {
      // Arrange: query contains non-numeric page
      const query: QueryObject = { page: "abc", limit: "5" };

      // Act & Assert: function throws validation error
      expect(() => getPaginationParams(query)).toThrowError(
        expect.objectContaining({
          statusCode: 400,
          statusMessage: "Bad Request",
          message: "Invalid pagination parameters",
        }),
      );
    });

    it("should throw 400 for invalid 'limit' value", () => {
      // Arrange: query contains negative limit
      const query: QueryObject = { page: "1", limit: "-3" };

      // Act & Assert: function throws validation error
      expect(() => getPaginationParams(query)).toThrowError(
        expect.objectContaining({
          statusCode: 400,
          statusMessage: "Bad Request",
          message: "Invalid pagination parameters",
        }),
      );
    });

    it("should throw 400 when page = 0", () => {
      // Arrange: query contains page = 0
      const query: QueryObject = { page: "0", limit: "5" };

      // Act & Assert: function throws validation error
      expect(() => getPaginationParams(query)).toThrowError(
        expect.objectContaining({
          statusCode: 400,
          statusMessage: "Bad Request",
          message: "Invalid pagination parameters",
        }),
      );
    });

    it("should throw 400 when limit = 0", () => {
      // Arrange: query contains limit = 0
      const query: QueryObject = { page: "1", limit: "0" };

      // Act & Assert: function throws validation error
      expect(() => getPaginationParams(query)).toThrowError(
        expect.objectContaining({
          statusCode: 400,
          statusMessage: "Bad Request",
          message: "Invalid pagination parameters",
        }),
      );
    });
  });

  describe("getPaginationObject", () => {
    const mockModel = {
      countDocuments: vi.fn(),
    } as unknown as Model<IProject>;

    beforeEach(() => {
      // Arrange: reset mock before each test
      vi.clearAllMocks();
    });

    it("should return correct pagination object when documents exceed limit", async () => {
      // Arrange: mock model returns 25 documents
      mockModel.countDocuments = vi.fn().mockResolvedValue(25);

      // Act: call helper with page=2, limit=10
      const result = await getPaginationObject(mockModel, 2, 10);

      // Assert: pagination object has correct prev/next and totals
      expect(result).toEqual({
        page: 2,
        limit: 10,
        prevPage: 1,
        nextPage: 3,
        totalDocuments: 25,
        totalPages: 3,
      });
    });

    it("should return null for 'prevPage' on first page", async () => {
      // Arrange: mock model returns 25 documents
      mockModel.countDocuments = vi.fn().mockResolvedValue(25);

      // Act: call helper with page=1, limit=10
      const result = await getPaginationObject(mockModel, 1, 10);

      // Assert: prevPage is null, nextPage is 2
      expect(result.prevPage).toBeNull();
      expect(result.nextPage).toBe(2);
    });

    it("should return null for 'nextPage' on last page", async () => {
      // Arrange: mock model returns 20 documents
      mockModel.countDocuments = vi.fn().mockResolvedValue(20);

      // Act: call helper with last available page
      const result = await getPaginationObject(mockModel, 2, 10);

      // Assert: prevPage is 1, nextPage is null
      expect(result.prevPage).toBe(1);
      expect(result.nextPage).toBeNull();
    });

    it("should throw 400 when 'page' is greater than 'totalPages'", async () => {
      // Arrange: mock model returns only 10 documents
      mockModel.countDocuments = vi.fn().mockResolvedValue(10);

      // Act: call helper with page = 5, limit = 5
      const result = getPaginationObject(mockModel, 5, 5);

      // Assert: requesting page 5 is invalid
      await expect(result).rejects.toMatchObject({
        statusCode: 400,
        message: "Invalid page number",
        statusMessage: "Bad Request",
      });
    });

    it("should return valid pagination when 'totalDocuments' = 0", async () => {
      // Arrange: mock model returns no documents
      mockModel.countDocuments = vi.fn().mockResolvedValue(0);

      // Act: call helper with page = 1, limit = 5
      const result = await getPaginationObject(mockModel, 1, 5);

      // Assert: requesting any page fails
      expect(result).toEqual({
        page: 1,
        limit: 5,
        prevPage: null,
        nextPage: null,
        totalDocuments: 0,
        totalPages: 1, // <- with Math.max(1, ...)
      });
    });
  });
});
