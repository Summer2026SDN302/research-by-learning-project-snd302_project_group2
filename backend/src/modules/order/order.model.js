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
     * Snapshot tai thoi diem dat hang: unitPrice x quantity.
     * Khong tinh lai sau - phan anh dung gia khach tra thuc te.
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
     * Tong gia truoc thue: Sigma lineTotal cua tat ca order items.
     */
    subTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    /**
     * Tong tien da giam do AI / MANUAL ap dung.
     * = Sigma (originalPrice - currentPrice) x quantity.
     * Chi dung de thong ke noi bo, khong hien thi tren receipt.
     */
    discountAmount: {
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
      enum: ["Pending", "Completed", "Cancelled", "Returned"],
      default: "Pending",
    },

    orderDate: {
      type: Date, // Fix #5: dung Date thay vi String de ho tro query $gte/$lte theo range
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Order", orderSchema);
