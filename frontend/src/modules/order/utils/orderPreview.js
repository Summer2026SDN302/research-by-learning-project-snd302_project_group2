const ORDER_PREVIEW_TAX_RATE = 0.08;

const roundCurrency = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

// Preview-only totals for the POS UI. Backend recalculates the authoritative values.
export const buildCartPreviewTotals = (items = []) => {
  const subtotal = roundCurrency(
    items.reduce(
      (sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 0),
      0,
    ),
  );
  const taxAmount = roundCurrency(subtotal * ORDER_PREVIEW_TAX_RATE);
  const totalAmount = roundCurrency(subtotal + taxAmount);

  return {
    subtotal,
    taxRate: ORDER_PREVIEW_TAX_RATE,
    taxAmount,
    totalAmount,
  };
};

export const buildCheckoutPreviewOrder = ({
  items = [],
  notes = null,
  totals,
}) => ({
  items: items.map((item) => ({
    foodItemId: item.foodItemId,
    name: item.name,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    note: item.note ?? null,
  })),
  notes,
  subTotal: totals.subtotal,
  taxRate: totals.taxRate,
  taxAmount: totals.taxAmount,
  totalAmount: totals.totalAmount,
  finalAmount: totals.totalAmount,
});
