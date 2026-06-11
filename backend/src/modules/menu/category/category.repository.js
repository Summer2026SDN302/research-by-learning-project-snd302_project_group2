import Category from "./category.model.js";
import { escapeRegex } from "../../../shared/helpers/regex.helper.js";
import { toObjectId } from "../../../shared/helpers/mongo.helper.js";

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

// Cross-collection read: $lookup into `fooditems` (no FoodItem model import).
// foodItemCount is computed at query time for list/detail responses.
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
    return Category.findOne({ _id: toObjectId(id), deletedAt: null });
  },

  async findByIdWithFoodItemCount(id) {
    const objectId = toObjectId(id);
    const [category] = await Category.aggregate([
      { $match: { _id: objectId, deletedAt: null } },
      ...foodItemCountStages,
    ]);

    return category ?? null;
  },

  async findByNameIgnoreCase(name, excludeId = null) {
    const filter = {
      name: name.trim(),
      deletedAt: null,
    };

    if (excludeId) {
      filter._id = { $ne: toObjectId(excludeId) };
    }

    return Category.findOne(filter).collation({ locale: "en", strength: 2 });
  },

  async create(data) {
    return Category.create(data);
  },

  async patchById(id, data) {
    return Category.findOneAndUpdate(
      { _id: toObjectId(id), deletedAt: null },
      { $set: data },
      { new: true, runValidators: true },
    );
  },

  async updateById(id, data) {
    return this.patchById(id, data);
  },
};

export default categoryRepository;
