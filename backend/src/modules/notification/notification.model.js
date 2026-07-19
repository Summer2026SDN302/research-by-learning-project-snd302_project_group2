import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["AI_Alert", "System_Log", "Order_Update"],
      index: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    metadata: {
      dedupKey: {
        type: String,
        required: true,
        trim: true,
      },
      actionType: {
        type: String,
        default: null,
      },
      actionPayload: {
        type: Schema.Types.Mixed,
        default: null,
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

notificationSchema.index(
  { userId: 1, "metadata.dedupKey": 1 },
  { unique: true, name: "uniq_user_dedup_key" }
);

export default mongoose.model("Notification", notificationSchema);
