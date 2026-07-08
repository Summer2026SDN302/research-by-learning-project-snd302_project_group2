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
  const totalAmount = subtotal;

  return {
    subtotal,
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
  totalAmount: totals.totalAmount,
  finalAmount: totals.totalAmount,
});
