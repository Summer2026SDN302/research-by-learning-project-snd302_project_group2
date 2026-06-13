import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },

    icon: {
      type: String,
      default: "restaurant_menu",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "categories",
  },
);

const nameUniqueIndexOptions = {
  unique: true,
  collation: { locale: "vi", strength: 2 },
};

categorySchema.index({ name: 1 }, nameUniqueIndexOptions);

categorySchema.index({ deletedAt: 1 });
categorySchema.index({ isActive: 1, deletedAt: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
