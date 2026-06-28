import mongoose from "mongoose";

const { Schema } = mongoose;

const orderItemSchema = new Schema(
  {
    foodItemId: {
      type: Schema.Types.ObjectId,
      ref: "FoodItem",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    /**
     * Snapshot tại thời điểm đặt hàng: unitPrice × quantity.
     * Không tính lại sau — phản ánh đúng giá khách trả thực tế.
     */
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    /**
     * Tổng giá trước thuế: Σ lineTotal của tất cả order items.
     */
    subTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    /**
     * Tổng tiền đã giảm do AI / MANUAL áp dụng.
     * = Σ (originalPrice − currentPrice) × quantity.
     * Chỉ dùng để thống kê nội bộ, không hiển thị trên receipt.
     */
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    orderStatus: {
      type: String,
      required: true,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled", "Returned"],
      default: "Pending",
    },

    orderDate: {
      type: Date, // Fix #5: dùng Date thay vì String để hỗ trợ query $gte/$lte theo range
      required: true,
    },

  },
  {
    timestamps: true,
  },
);

orderSchema.index({ orderDate: 1, orderStatus: 1 });
orderSchema.index({ "items.foodItemId": 1 });

export default mongoose.model("Order", orderSchema);
