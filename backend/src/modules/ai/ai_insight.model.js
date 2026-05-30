import mongoose from "mongoose";

const { Schema } = mongoose;

const forecastSchema = new Schema(
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
      enum: ["Pending", "Applied", "Rejected"],
      default: "Pending",
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
  },
  { _id: false },
);

const pricingRecommendationSchema = new Schema(
  {
    foodItemId: {
      type: Schema.Types.ObjectId,
      ref: "FoodItem",
      required: true,
    },

    recommendationId: {
      type: Schema.Types.ObjectId,
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
      enum: ["Pending", "Applied", "Rejected"],
      default: "Pending",
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
  },
  { _id: false },
);

const aiInsightSchema = new Schema(
  {
    targetDate: {
      type: String,
      required: true,
      index: true,
    },

    version: {
      type: String,
      required: true,
    },

    forecasts: [forecastSchema],

    pricingRecommendations: [pricingRecommendationSchema],

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  },
);

export default mongoose.model("AiInsight", aiInsightSchema);
