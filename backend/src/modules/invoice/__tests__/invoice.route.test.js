import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AppError from "../../../shared/exceptions/AppError.js";
import { errorHandler } from "../../../middlewares/error.middleware.js";
import invoiceRoute from "../invoice.route.js";
import invoiceService from "../invoice.service.js";

vi.mock("../invoice.service.js", () => ({
  default: {
    getInvoiceById: vi.fn(),
    getInvoiceReceipt: vi.fn(),
    printInvoiceReceipt: vi.fn(),
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

const INVOICE_ID = "507f1f77bcf86cd799439011";

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/invoices", invoiceRoute);
  app.use(errorHandler);
  return app;
};

describe("invoice routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/invoices/:id", () => {
    it("returns invoice detail for admin users", async () => {
      invoiceService.getInvoiceById.mockResolvedValue({
        _id: INVOICE_ID,
        invoiceNumber: "INV-20260626-1234",
      });

      const response = await request(createApp())
        .get(`/api/invoices/${INVOICE_ID}`)
        .set("x-test-role", "Admin");

      expect(response.status).toBe(200);
      expect(response.body.data.invoiceNumber).toBe("INV-20260626-1234");
      expect(invoiceService.getInvoiceById).toHaveBeenCalledWith(
        INVOICE_ID,
        "507f1f77bcf86cd799439099",
        "Admin",
      );
    });
  });

  describe("GET /api/invoices/:id/receipt", () => {
    it("returns receipt payload for staff users", async () => {
      invoiceService.getInvoiceReceipt.mockResolvedValue({
        invoiceId: INVOICE_ID,
        invoiceNumber: "INV-20260626-1234",
        printCount: 1,
      });

      const response = await request(createApp())
        .get(`/api/invoices/${INVOICE_ID}/receipt`)
        .set("x-test-role", "Staff");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        invoiceId: INVOICE_ID,
        invoiceNumber: "INV-20260626-1234",
        printCount: 1,
      });
    });

    it("propagates invoice access errors", async () => {
      invoiceService.getInvoiceReceipt.mockRejectedValue(
        new AppError(
          "You do not have permission to access this invoice",
          403,
          "INSUFFICIENT_PERMISSIONS",
        ),
      );

      const response = await request(createApp())
        .get(`/api/invoices/${INVOICE_ID}/receipt`)
        .set("x-test-role", "Staff");

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("INSUFFICIENT_PERMISSIONS");
    });
  });

  describe("POST /api/invoices/:id/print", () => {
    it("updates print audit and returns latest counters", async () => {
      invoiceService.printInvoiceReceipt.mockResolvedValue({
        invoiceId: INVOICE_ID,
        invoiceNumber: "INV-20260626-1234",
        printCount: 2,
        lastPrintedAt: "2026-06-26T03:15:00.000Z",
      });

      const response = await request(createApp())
        .post(`/api/invoices/${INVOICE_ID}/print`)
        .set("x-test-role", "Manager");

      expect(response.status).toBe(200);
      expect(response.body.data.printCount).toBe(2);
      expect(invoiceService.printInvoiceReceipt).toHaveBeenCalledWith(
        INVOICE_ID,
        "507f1f77bcf86cd799439099",
        "Manager",
      );
    });

    it("validates invoice ids before printing", async () => {
      const response = await request(createApp())
        .post("/api/invoices/not-a-mongo-id/print")
        .set("x-test-role", "Manager");

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(invoiceService.printInvoiceReceipt).not.toHaveBeenCalled();
    });
  });
});
