import { describe, expect, it } from "vitest";
import { validationResult } from "express-validator";

import { validateDayParam, validateUpdateBody, validateBatchUpdateBody } from "../scheduled_menu.validation.js";

const runValidations = async (validations, req) => {
  for (const validation of validations) {
    await validation.run(req);
  }
  return validationResult(req);
};

const makeReq = ({ params = {}, body = {} } = {}) => ({
  params,
  body,
});

describe("validateDayParam", () => {
  it("accepts valid dayOfWeek values", async () => {
    const result = await runValidations(
      validateDayParam,
      makeReq({ params: { dayOfWeek: "Monday" } }),
    );

    expect(result.isEmpty()).toBe(true);
  });

  it("rejects invalid dayOfWeek values", async () => {
    const result = await runValidations(
      validateDayParam,
      makeReq({ params: { dayOfWeek: "Funday" } }),
    );

    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("dayOfWeek");
  });
});

describe("validateUpdateBody", () => {
  it("accepts valid foodItemIds array", async () => {
    const result = await runValidations(
      validateUpdateBody,
      makeReq({
        body: {
          foodItemIds: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
        },
      }),
    );

    expect(result.isEmpty()).toBe(true);
  });

  it("accepts empty foodItemIds array", async () => {
    const result = await runValidations(
      validateUpdateBody,
      makeReq({ body: { foodItemIds: [] } }),
    );

    expect(result.isEmpty()).toBe(true);
  });

  it("rejects missing foodItemIds", async () => {
    const result = await runValidations(validateUpdateBody, makeReq({ body: {} }));

    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("foodItemIds");
  });

  it("rejects non-array foodItemIds", async () => {
    const result = await runValidations(
      validateUpdateBody,
      makeReq({ body: { foodItemIds: "not-an-array" } }),
    );

    expect(result.isEmpty()).toBe(false);
  });

  it("rejects invalid MongoDB ObjectId in foodItemIds", async () => {
    const result = await runValidations(
      validateUpdateBody,
      makeReq({ body: { foodItemIds: ["invalid-id"] } }),
    );

    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("foodItemIds[0]");
  });
});

describe("validateBatchUpdateBody", () => {
  it("accepts valid batch update payload", async () => {
    const result = await runValidations(
      validateBatchUpdateBody,
      makeReq({
        body: {
          days: [
            {
              dayOfWeek: "Monday",
              foodItemIds: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
            },
            {
              dayOfWeek: "Friday",
              foodItemIds: [],
            },
          ],
        },
      }),
    );

    expect(result.isEmpty()).toBe(true);
  });

  it("rejects empty days array", async () => {
    const result = await runValidations(
      validateBatchUpdateBody,
      makeReq({
        body: {
          days: [],
        },
      }),
    );

    expect(result.isEmpty()).toBe(false);
  });

  it("rejects invalid dayOfWeek in days array", async () => {
    const result = await runValidations(
      validateBatchUpdateBody,
      makeReq({
        body: {
          days: [
            {
              dayOfWeek: "InvalidDay",
              foodItemIds: [],
            },
          ],
        },
      }),
    );

    expect(result.isEmpty()).toBe(false);
  });

  it("rejects invalid MongoDB ObjectId in foodItemIds in batch", async () => {
    const result = await runValidations(
      validateBatchUpdateBody,
      makeReq({
        body: {
          days: [
            {
              dayOfWeek: "Monday",
              foodItemIds: ["not-a-mongo-id"],
            },
          ],
        },
      }),
    );

    expect(result.isEmpty()).toBe(false);
  });
});
