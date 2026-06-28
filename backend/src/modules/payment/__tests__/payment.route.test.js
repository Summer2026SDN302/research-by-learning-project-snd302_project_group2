import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AppError from "../../../shared/exceptions/AppError.js";
import { errorHandler } from "../../../middlewares/error.middleware.js";
import paymentRoute from "../payment.route.js";
import paymentService from "../payment.service.js";

vi.mock("../payment.service.js", () => ({
  default: {
    getPayments: vi.fn(),
    getPaymentById: vi.fn(),
    checkout: vi.fn(),
    initiatePayment: vi.fn(),
    confirmPayment: vi.fn(),
    failPayment: vi.fn(),
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

  describe("GET /api/payments/:id", () => {
    it("returns payment detail for manager users", async () => {
      paymentService.getPaymentById.mockResolvedValue({
        _id: PAYMENT_ID,
        paymentNumber: "PAY-20260626-1234",
      });

      const response = await request(createApp())
        .get(`/api/payments/${PAYMENT_ID}`)
        .set("x-test-role", "Manager");

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        _id: PAYMENT_ID,
        paymentNumber: "PAY-20260626-1234",
      });
      expect(paymentService.getPaymentById).toHaveBeenCalledWith(
        PAYMENT_ID,
        "507f1f77bcf86cd799439099",
        "Manager",
      );
    });
  });

  describe("POST /api/payments", () => {
    it("initiates a payment for staff users", async () => {
      const payload = {
        orderId: "507f1f77bcf86cd799439012",
        paymentMethod: "Cash",
        amountReceived: 120000,
      };

      paymentService.initiatePayment.mockResolvedValue({
        _id: PAYMENT_ID,
        paymentStatus: "Pending",
      });

      const response = await request(createApp())
        .post("/api/payments")
        .set("x-test-role", "Staff")
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(paymentService.initiatePayment).toHaveBeenCalledWith(
        payload,
        "507f1f77bcf86cd799439099",
        "Staff",
      );
    });

    it("validates the payment initiation payload", async () => {
      const response = await request(createApp())
        .post("/api/payments")
        .set("x-test-role", "Manager")
        .send({
          orderId: "not-a-mongo-id",
          paymentMethod: "Momo",
          amountReceived: -1,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(paymentService.initiatePayment).not.toHaveBeenCalled();
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

  describe("PATCH /api/payments/:id/confirm", () => {
    it("propagates insufficient cash errors", async () => {
      paymentService.confirmPayment.mockRejectedValue(
        new AppError(
          "Cash received is insufficient",
          400,
          "INSUFFICIENT_CASH_RECEIVED",
        ),
      );

      const response = await request(createApp())
        .patch(`/api/payments/${PAYMENT_ID}/confirm`)
        .set("x-test-role", "Staff")
        .send({
          amountReceived: 1000,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("INSUFFICIENT_CASH_RECEIVED");
    });
  });

  describe("PATCH /api/payments/:id/fail", () => {
    it("marks a payment as failed for manager users", async () => {
      paymentService.failPayment.mockResolvedValue({
        _id: PAYMENT_ID,
        paymentStatus: "Failed",
        failureReason: "Operator cancelled",
      });

      const response = await request(createApp())
        .patch(`/api/payments/${PAYMENT_ID}/fail`)
        .set("x-test-role", "Manager")
        .send({
          failureReason: "Operator cancelled",
        });

      expect(response.status).toBe(200);
      expect(response.body.data.paymentStatus).toBe("Failed");
      expect(paymentService.failPayment).toHaveBeenCalledWith(
        PAYMENT_ID,
        { failureReason: "Operator cancelled" },
        "507f1f77bcf86cd799439099",
        "Manager",
      );
    });
  });
});
