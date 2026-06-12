import mongoose from "mongoose";

const { Schema } = mongoose;

const foodItemSchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: 1000,
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    cost: {
      type: Number,
      required: true,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "fooditems",
  },
);

foodItemSchema.index({ deletedAt: 1 });
foodItemSchema.index({ categoryId: 1, isActive: 1, isArchived: 1, deletedAt: 1 });

const FoodItem = mongoose.model("FoodItem", foodItemSchema);

export default FoodItem;
