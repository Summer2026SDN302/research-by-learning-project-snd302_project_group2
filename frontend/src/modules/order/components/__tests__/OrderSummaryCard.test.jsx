import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import OrderSummaryCard from "../OrderSummaryCard";

describe("OrderSummaryCard", () => {
  it("renders the shared order notes provided by the hook", () => {
    render(
      <OrderSummaryCard
        cart={{
          items: [
            {
              foodItemId: "food-1",
              name: "Pho",
              unitPrice: 35000,
              quantity: 1,
              note: null,
            },
          ],
        }}
        totals={{
          subtotal: 35000,
          taxRate: 0.08,
          taxAmount: 2800,
          totalAmount: 37800,
        }}
        orderNotes="Ban 7"
        onOrderNotesChange={vi.fn()}
        onUpdateQuantity={vi.fn()}
        onUpdateNote={vi.fn()}
        onRemove={vi.fn().mockResolvedValue(true)}
        onClearCart={vi.fn().mockResolvedValue(true)}
        onCheckout={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue("Ban 7")).toBeInTheDocument();
  });
});
