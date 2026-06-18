import mongoose from "mongoose";
import { DAY_OF_WEEK } from "./scheduled_menu.constants.js";

const { Schema } = mongoose;

const scheduledMenuSchema = new Schema(
  {
    dayOfWeek: {
      type: String,
      required: true,
      unique: true,
      enum: DAY_OF_WEEK,
    },

    menuItems: [
      {
        foodItemId: {
          type: Schema.Types.ObjectId,
          ref: "FoodItem",
          required: true,
        },
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("ScheduledMenu", scheduledMenuSchema);
