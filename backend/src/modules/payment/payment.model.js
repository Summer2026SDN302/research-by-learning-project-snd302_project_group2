import mongoose from "mongoose";
import {
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  PAYMENT_TRANSACTION_CODE_LOCKED_STATUSES,
} from "./payment.constants.js";

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
      enum: Object.values(PAYMENT_METHOD),
      index: true,
    },
    amountReceived: {
      type: Number,
      required: true,
      min: 0,
    },
    changeReturned: {
      type: Number,
      default: 0,
      min: 0,
    },
    transactionCode: {
      type: String,
      default: null,
      trim: true,
      maxlength: 120,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
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
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index(
  { transactionCode: 1 },
  {
    name: "transactionCode_paid_unique",
    unique: true,
    partialFilterExpression: {
      transactionCode: { $type: "string" },
      paymentStatus: { $in: PAYMENT_TRANSACTION_CODE_LOCKED_STATUSES },
    },
  },
);

export default mongoose.model("Payment", paymentSchema);
