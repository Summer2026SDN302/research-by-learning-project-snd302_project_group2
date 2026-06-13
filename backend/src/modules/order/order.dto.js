export const toOrderResponse = (order) => ({
  _id: order._id,
  orderNumber: order.orderNumber,
  staffId: order.staffId,
  items: (order.items ?? []).map((item) => ({
    foodItemId: item.foodItemId,
    name: item.name,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
  })),
  discountAmount: order.discountAmount,
  taxAmount: order.taxAmount,
  totalAmount: order.totalAmount,
  orderStatus: order.orderStatus,
  orderDate: order.orderDate,
  isActive: order.isActive,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});
