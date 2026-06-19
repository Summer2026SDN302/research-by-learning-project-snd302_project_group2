// import FoodItem from "./food_item.model.js";

export const findFoodItemsByIds = async (ids) => {
  return FoodItem.find({
    _id: { $in: ids },
    isArchived: false,
  }).select("_id basePrice name");
};

export const findFoodItemById = async (id) => {
  return FoodItem.findOne({
    _id: id,
    isArchived: false,
  }).select("_id basePrice name");
};
import { escapeRegex } from "../../../shared/helpers/regex.helper.js";
import { toObjectId } from "../../../shared/helpers/mongo.helper.js";
import FoodItem from "./food_item.model.js";

const buildListFilter = ({ search, categoryId, isArchived }) => {
  const filter = {};

  if (search) {
    filter.name = { $regex: escapeRegex(search), $options: "i" };
  }

  if (categoryId) {
    filter.categoryId = toObjectId(categoryId);
  }

  if (isArchived !== undefined) {
    filter.isArchived = isArchived;
  }

  return filter;
};

// Cross-collection read: $lookup into `categories` (no Category model import).
const categoryLookupStages = [
  {
    $lookup: {
      from: "categories",
      localField: "categoryId",
      foreignField: "_id",
      as: "category",
    },
  },
  {
    $addFields: {
      categoryName: {
        $ifNull: [{ $arrayElemAt: ["$category.name", 0] }, null],
      },
    },
  },
  {
    $project: {
      category: 0,
    },
  },
];

const foodItemRepository = {
  async findAll({ search, page, limit, categoryId, isArchived }) {
    const filter = buildListFilter({ search, categoryId, isArchived });
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      FoodItem.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        ...categoryLookupStages,
        { $skip: skip },
        { $limit: limit },
      ]),
      FoodItem.countDocuments(filter),
    ]);

    return { items, total };
  },

  async findById(id) {
    return FoodItem.findOne({ _id: toObjectId(id) });
  },

  async findByIdWithCategory(id) {
    const [foodItem] = await FoodItem.aggregate([
      { $match: { _id: toObjectId(id) } },
      ...categoryLookupStages,
    ]);

    return foodItem ?? null;
  },
  async findByNameIgnoreCase(name, excludeId = null) {
    const filter = { name: name.trim() };

    if (excludeId) {
      filter._id = { $ne: toObjectId(excludeId) };
    }

    return FoodItem.findOne(filter).collation({ locale: "vi", strength: 2 });
  },

  async countActiveByCategoryId(categoryId) {
    return FoodItem.countDocuments({
      categoryId: toObjectId(categoryId),
      isArchived: false,
    });
  },

  async countActiveByIds(ids) {
    if (!ids.length) {
      return 0;
    }

    return FoodItem.countDocuments({
      _id: { $in: ids.map(toObjectId) },
      deletedAt: null,
    });
  },

  async create(data) {
    return FoodItem.create(data);
  },

  async patchById(id, data) {
    return FoodItem.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: data },
      { new: true, runValidators: true },
    );
  },
};

export default foodItemRepository;
