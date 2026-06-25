import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ReceiptView from "../ReceiptView";

describe("ReceiptView", () => {
  it("renders shared order notes, item notes, and respects receipt line totals", () => {
    render(
      <ReceiptView
        receipt={{
          invoiceNumber: "INV-001",
          issuedAt: "2026-06-25T10:00:00.000Z",
          staff: {
            fullName: "Staff A",
          },
          notes: "Ban 5 - mang di",
          lineItems: [
            {
              name: "Com Tam",
              quantity: 2,
              unitPrice: 45000,
              lineTotal: 91000,
              note: "Khong hanh",
            },
          ],
          subtotalAmount: 91000,
          discountAmount: 0,
          taxRate: 0.08,
          taxAmount: 7280,
          finalAmount: 98280,
        }}
      />,
    );

    expect(screen.getByText("Ban 5 - mang di")).toBeInTheDocument();
    expect(screen.getByText(/Khong hanh/)).toBeInTheDocument();
    expect(screen.getAllByText(/91\.000/)).toHaveLength(2);
    expect(screen.queryByText(/90\.000/)).not.toBeInTheDocument();
  });
});
