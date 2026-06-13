import mongoose from "mongoose";

const { Schema } = mongoose;

const scheduledMenuSchema = new Schema(
  {
    dayOfWeek: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
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
