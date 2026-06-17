import mongoose from "mongoose";

const { Schema } = mongoose;

const priceHistorySchema = new Schema(
  {
    oldValue: {
      type: Number,
      required: true,
      min: 0,
    },

    newValue: {
      type: Number,
      required: true,
      min: 0,
    },

    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },

    source: {
      type: String,
      required: true,
      enum: ["AI", "MANUAL"],
    },

    recommendationId: {
      type: Schema.Types.ObjectId,
      ref: "AiInsight",
      default: null,
    },

    reason: {
      type: String,
      default: null,
    },
  },
  { _id: false },
);

const dailyMenuItemSchema = new Schema(
  {
    foodItemId: {
      type: Schema.Types.ObjectId,
      ref: "FoodItem",
      required: true,
    },

    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    preparedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    soldQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    remainingQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      required: true,
      enum: ["Available", "Unavailable"],
    },

    priceHistory: [priceHistorySchema],

    quantityAdjustedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    adjustedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const dailyMenuSchema = new Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
    },

    isConfigured: {
      type: Boolean,
      default: false,
    },

    items: [dailyMenuItemSchema],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("DailyMenu", dailyMenuSchema);
