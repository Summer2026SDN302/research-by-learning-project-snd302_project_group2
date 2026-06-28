const mapUserReference = (user) => {
  if (!user) {
    return null;
  }

  if (typeof user === "string") {
    return user;
  }

  return {
    _id: user._id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
  };
};

export const toInvoiceResponse = (invoice) => ({
  _id: invoice._id,
  invoiceNumber: invoice.invoiceNumber,
  orderId: invoice.orderId?._id ?? invoice.orderId,
  paymentId: invoice.paymentId?._id ?? invoice.paymentId,
  staffId: mapUserReference(invoice.staffId),
  lineItems: (invoice.lineItems ?? []).map((item) => ({
    foodItemId: item.foodItemId?._id ?? item.foodItemId,
    name: item.name,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
    note: item.note ?? null,
  })),
  notes: invoice.notes ?? null,
  subtotalAmount: invoice.subtotalAmount,
  discountAmount: invoice.discountAmount,
  taxRate: invoice.taxRate,
  taxAmount: invoice.taxAmount,
  finalAmount: invoice.finalAmount,
  paymentMethod: invoice.paymentMethod,
  transactionCode: invoice.transactionCode ?? null,
  invoiceStatus: invoice.invoiceStatus,
  issuedAt: invoice.issuedAt,
  printCount: invoice.printCount,
  lastPrintedAt: invoice.lastPrintedAt,
  lastPrintedBy: mapUserReference(invoice.lastPrintedBy),
  createdAt: invoice.createdAt,
  updatedAt: invoice.updatedAt,
});

export const toInvoiceReceiptResponse = (invoice) => ({
  invoiceId: invoice._id,
  invoiceNumber: invoice.invoiceNumber,
  issuedAt: invoice.issuedAt,
  invoiceStatus: invoice.invoiceStatus,
  staff: mapUserReference(invoice.staffId),
  lineItems: (invoice.lineItems ?? []).map((item) => ({
    foodItemId: item.foodItemId?._id ?? item.foodItemId,
    name: item.name,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
    note: item.note ?? null,
  })),
  notes: invoice.notes ?? null,
  subtotalAmount: invoice.subtotalAmount,
  discountAmount: invoice.discountAmount,
  taxRate: invoice.taxRate,
  taxAmount: invoice.taxAmount,
  finalAmount: invoice.finalAmount,
  paymentMethod: invoice.paymentMethod,
  transactionCode: invoice.transactionCode ?? null,
  printCount: invoice.printCount,
  lastPrintedAt: invoice.lastPrintedAt,
  lastPrintedBy: mapUserReference(invoice.lastPrintedBy),
});
