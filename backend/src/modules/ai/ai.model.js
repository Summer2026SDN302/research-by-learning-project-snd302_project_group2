import mongoose from "mongoose";
import { FORECAST_STATUS, FORECAST_STATUS_VALUES } from "./ai.constants.js";

const { Schema } = mongoose;

const forecastSchema = new Schema({
  foodItemId: {
    type: Schema.Types.ObjectId,
    ref: "FoodItem",
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  predictedDemand: {
    type: Number,
    required: true,
  },

  recommendedQuantity: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    required: true,
    enum: FORECAST_STATUS_VALUES,
    default: FORECAST_STATUS.PENDING,
  },

  appliedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  appliedAt: {
    type: Date,
    default: null,
  },

  rejectedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  rejectedAt: {
    type: Date,
    default: null,
  },
});

const pricingRecommendationSchema = new Schema({
  foodItemId: {
    type: Schema.Types.ObjectId,
    ref: "FoodItem",
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  currentRemaining: {
    type: Number,
    required: true,
  },

  originalPrice: {
    type: Number,
    required: true,
    min: 0,
  },

  recommendedPrice: {
    type: Number,
    required: true,
    min: 0,
  },

  recommendedDiscountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },

  reason: {
    type: String,
    default: null,
  },

  status: {
    type: String,
    required: true,
    enum: FORECAST_STATUS_VALUES,
    default: FORECAST_STATUS.PENDING,
  },

  appliedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  appliedAt: {
    type: Date,
    default: null,
  },

  rejectedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  rejectedAt: {
    type: Date,
    default: null,
  },
});

const aiInsightSchema = new Schema(
  {
    targetDate: {
      type: Date,
      required: true,
      index: true,
    },

    version: {
      type: Number,
      required: true,
      default: 1,
    },

    forecasts: [forecastSchema],

    pricingRecommendations: [pricingRecommendationSchema],

    metrics: {
      confidence: {
        type: Number,
        default: 0,
      },
      modelName: {
        type: String,
        default: "",
      },
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: false,
  },
);

export default mongoose.model("AiInsight", aiInsightSchema);
