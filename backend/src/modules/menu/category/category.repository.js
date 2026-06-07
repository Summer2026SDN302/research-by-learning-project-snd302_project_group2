import Category from "./category.model.js";
import FoodItem from "../food_item/food_item.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildListFilter = ({ search, isActive }) => {
  const filter = { deletedAt: null };

  if (search) {
    filter.name = { $regex: escapeRegex(search), $options: "i" };
  }

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  return filter;
};

const foodItemCountStages = [
  {
    $lookup: {
      from: "fooditems",
      let: { categoryId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$categoryId", "$$categoryId"] },
            deletedAt: null,
            isArchived: false,
          },
        },
        { $count: "count" },
      ],
      as: "foodItemStats",
    },
  },
  {
    $addFields: {
      foodItemCount: {
        $ifNull: [{ $arrayElemAt: ["$foodItemStats.count", 0] }, 0],
      },
    },
  },
  {
    $project: {
      foodItemStats: 0,
    },
  },
];

const categoryRepository = {
  async findAllWithFoodItemCount({ search, page, limit, isActive }) {
    const filter = buildListFilter({ search, isActive });
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Category.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        ...foodItemCountStages,
        { $skip: skip },
        { $limit: limit },
      ]),
      Category.countDocuments(filter),
    ]);

    return { items, total };
  },

  async findById(id) {
    return Category.findOne({ _id: id, deletedAt: null });
  },

  async findByIdWithFoodItemCount(id) {
    const [category] = await Category.aggregate([
      { $match: { _id: id, deletedAt: null } },
      ...foodItemCountStages,
    ]);

    return category ?? null;
  },

  async findByNameIgnoreCase(name, excludeId = null) {
    const filter = {
      name: { $regex: `^${escapeRegex(name.trim())}$`, $options: "i" },
      deletedAt: null,
    };

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    return Category.findOne(filter);
  },

  async create(data) {
    return Category.create(data);
  },

  async updateById(id, data) {
    return Category.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: data },
      { new: true, runValidators: true },
    );
  },

  async updateStatusById(id, isActive) {
    return Category.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { isActive } },
      { new: true, runValidators: true },
    );
  },

  async softDeleteById(id, deletedBy) {
    return Category.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date(), deletedBy } },
      { new: true },
    );
  },

  async countActiveFoodItems(categoryId) {
    return FoodItem.countDocuments({
      categoryId,
      deletedAt: null,
      isArchived: false,
    });
  },
};

export default categoryRepository;
