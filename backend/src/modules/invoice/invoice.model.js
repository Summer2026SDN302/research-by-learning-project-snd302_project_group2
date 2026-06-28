import mongoose from "mongoose";
import { INVOICE_STATUS } from "./invoice.constants.js";

const { Schema } = mongoose;

const invoiceLineItemSchema = new Schema(
  {
    foodItemId: {
      type: Schema.Types.ObjectId,
      ref: "FoodItem",
      default: null,
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
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      default: null,
      trim: true,
      maxlength: 300,
    },
  },
  { _id: false },
);

const invoiceSchema = new Schema(
  {
    invoiceNumber: {
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
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      index: true,
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lineItems: {
      type: [invoiceLineItemSchema],
      default: [],
    },
    notes: {
      type: String,
      default: null,
      trim: true,
      maxlength: 1000,
    },
    subtotalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxRate: {
      type: Number,
      required: true,
      min: 0,
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    transactionCode: {
      type: String,
      default: null,
      trim: true,
      maxlength: 120,
    },
    invoiceStatus: {
      type: String,
      required: true,
      enum: Object.values(INVOICE_STATUS),
      default: INVOICE_STATUS.ISSUED,
    },
    issuedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    printCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastPrintedAt: {
      type: Date,
      default: null,
    },
    lastPrintedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Invoice", invoiceSchema);
