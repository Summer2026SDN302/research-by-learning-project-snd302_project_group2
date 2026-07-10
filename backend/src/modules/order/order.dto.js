export const toOrderResponse = (order) => ({
  _id: order._id,
  orderNumber: order.orderNumber,
  // Fix #6: staffId là raw ObjectId (chưa populate).
  // Nếu frontend cần tên nhân viên, thêm .populate("staffId", "name") trong repository.
  staffId: order.staffId,
  items: (order.items ?? []).map((item) => ({
    // Sau khi populate, foodItemId là FoodItem object — trả về _id để giữ response clean
    foodItemId: item.foodItemId?._id ?? item.foodItemId,
    name: item.name,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
  })),
  subTotal: order.subTotal,
  discountAmount: order.discountAmount,
  taxAmount: order.taxAmount,
  totalAmount: order.totalAmount,
  orderStatus: order.orderStatus,
  orderDate: order.orderDate,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});
