import mongoose from "mongoose";

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    paymentNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: ["Cash", "Momo", "VNPay"],
    },

    amountReceived: {
      type: Number,
      required: true,
      min: 0,
    },

    changeReturned: {
      type: Number,
      required: true,
      min: 0,
    },

    transactionCode: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },

    paymentStatus: {
      type: String,
      required: true,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    refundedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    refundReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({ paymentStatus: 1, createdAt: -1 });
paymentSchema.index({ paymentMethod: 1, paymentStatus: 1 });

export default mongoose.model("Payment", paymentSchema);
