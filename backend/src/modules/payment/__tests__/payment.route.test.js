import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { errorHandler } from "../../../middlewares/error.middleware.js";
import paymentRoute from "../payment.route.js";
import paymentService from "../payment.service.js";

vi.mock("../payment.service.js", () => ({
  default: {
    getPayments: vi.fn(),
    getPaymentReceipt: vi.fn(),
    checkout: vi.fn(),
    printPaymentReceipt: vi.fn(),
  },
}));

const { mockAuthenticate } = vi.hoisted(() => {
  class TestAppError extends Error {
    constructor(message, statusCode, code) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
    }
  }

  return {
    mockAuthenticate: (req, _res, next) => {
      const role = req.headers["x-test-role"];

      if (!role) {
        return next(
          new TestAppError("Authentication required", 401, "AUTHENTICATION_REQUIRED"),
        );
      }

      req.user = { role };
      req.userId = "507f1f77bcf86cd799439099";
      return next();
    },
  };
});

vi.mock("../../../middlewares/auth.middleware.js", () => ({
  authenticate: mockAuthenticate,
}));

const PAYMENT_ID = "507f1f77bcf86cd799439011";

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/payments", paymentRoute);
  app.use(errorHandler);
  return app;
};

describe("payment routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/payments", () => {
    it("returns the payment list for admin users", async () => {
      paymentService.getPayments.mockResolvedValue({
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });

      const response = await request(createApp())
        .get("/api/payments")
        .query({
          search: "PAY-001",
          paymentStatus: "Paid",
          paymentMethod: "QR",
          page: "1",
          limit: "10",
        })
        .set("x-test-role", "Admin");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(paymentService.getPayments).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "PAY-001",
          paymentStatus: "Paid",
          paymentMethod: "QR",
          page: "1",
          limit: "10",
        }),
      );
    });

    it("returns 403 for staff users", async () => {
      const response = await request(createApp())
        .get("/api/payments")
        .set("x-test-role", "Staff");

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("INSUFFICIENT_PERMISSIONS");
    });
  });

  describe("GET /api/payments/:id/receipt", () => {
    it("returns the payment receipt for manager users", async () => {
      paymentService.getPaymentReceipt.mockResolvedValue({
        paymentId: PAYMENT_ID,
        paymentNumber: "PAY-20260626-1234",
      });

      const response = await request(createApp())
        .get(`/api/payments/${PAYMENT_ID}/receipt`)
        .set("x-test-role", "Manager");

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        paymentId: PAYMENT_ID,
        paymentNumber: "PAY-20260626-1234",
      });
      expect(paymentService.getPaymentReceipt).toHaveBeenCalledWith(
        PAYMENT_ID,
        "507f1f77bcf86cd799439099",
        "Manager",
      );
    });
  });

  describe("POST /api/payments/checkout", () => {
    it("completes a checkout for staff users", async () => {
      const payload = {
        items: [
          {
            foodItemId: "507f1f77bcf86cd799439012",
            quantity: 2,
          },
        ],
        notes: "Mang di",
        paymentMethod: "Cash",
        amountReceived: 120000,
      };

      paymentService.checkout.mockResolvedValue({
        _id: PAYMENT_ID,
        paymentStatus: "Paid",
      });

      const response = await request(createApp())
        .post("/api/payments/checkout")
        .set("x-test-role", "Staff")
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(paymentService.checkout).toHaveBeenCalledWith(
        payload,
        "507f1f77bcf86cd799439099",
      );
    });
  });

  describe("POST /api/payments/:id/print", () => {
    it("prepares the receipt for manager users", async () => {
      paymentService.printPaymentReceipt.mockResolvedValue({
        paymentId: PAYMENT_ID,
        paymentNumber: "PAY-20260626-9999",
      });

      const response = await request(createApp())
        .post(`/api/payments/${PAYMENT_ID}/print`)
        .set("x-test-role", "Manager");

      expect(response.status).toBe(200);
      expect(response.body.data.paymentId).toBe(PAYMENT_ID);
      expect(paymentService.printPaymentReceipt).toHaveBeenCalledWith(
        PAYMENT_ID,
        "507f1f77bcf86cd799439099",
        "Manager",
      );
    });

    it("validates the payment id before printing", async () => {
      const response = await request(createApp())
        .post("/api/payments/not-a-mongo-id/print")
        .set("x-test-role", "Admin");

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(paymentService.printPaymentReceipt).not.toHaveBeenCalled();
    });
  });
});
