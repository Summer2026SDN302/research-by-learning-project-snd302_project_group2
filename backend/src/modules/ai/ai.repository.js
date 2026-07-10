import AiInsight from "./ai.model.js";

export const findLatestByDate = async (targetDate) => {
  const start = new Date(targetDate);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(targetDate);
  end.setUTCHours(23, 59, 59, 999);

  return AiInsight.findOne({
    targetDate: { $gte: start, $lte: end },
    isActive: true,
    deletedAt: null,
  })
    .sort({ generatedAt: -1 })
    .populate("forecasts.appliedBy forecasts.rejectedBy", "username fullName role")
    .populate({
      path: "forecasts.foodItemId",
      populate: { path: "categoryId", select: "name" },
    })
    .populate("pricingRecommendations.appliedBy pricingRecommendations.rejectedBy", "username fullName role")
    .populate({
      path: "pricingRecommendations.foodItemId",
      populate: { path: "categoryId", select: "name" },
    });
};

export const findByDateAndVersion = async (targetDate, version) => {
  const start = new Date(targetDate);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(targetDate);
  end.setUTCHours(23, 59, 59, 999);

  return AiInsight.findOne({
    targetDate: { $gte: start, $lte: end },
    version,
    isActive: true,
    deletedAt: null,
  })
    .populate("forecasts.appliedBy forecasts.rejectedBy", "username fullName role")
    .populate({
      path: "forecasts.foodItemId",
      populate: { path: "categoryId", select: "name" },
    })
    .populate("pricingRecommendations.appliedBy pricingRecommendations.rejectedBy", "username fullName role")
    .populate({
      path: "pricingRecommendations.foodItemId",
      populate: { path: "categoryId", select: "name" },
    });
};

export const findVersionsByDate = async (targetDate) => {
  const start = new Date(targetDate);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(targetDate);
  end.setUTCHours(23, 59, 59, 999);

  return AiInsight.find({
    targetDate: { $gte: start, $lte: end },
    isActive: true,
    deletedAt: null,
  })
    .select("version generatedAt")
    .sort({ version: 1 });
};

export const findById = async (insightId) => {
  return AiInsight.findOne({
    _id: insightId,
    isActive: true,
    deletedAt: null,
  })
    .populate("forecasts.appliedBy forecasts.rejectedBy", "username fullName role")
    .populate({
      path: "forecasts.foodItemId",
      populate: { path: "categoryId", select: "name" },
    })
    .populate("pricingRecommendations.appliedBy pricingRecommendations.rejectedBy", "username fullName role")
    .populate({
      path: "pricingRecommendations.foodItemId",
      populate: { path: "categoryId", select: "name" },
    });
};

export const createInsight = async (payload) => {
  return AiInsight.create(payload);
};

export const saveInsight = async (insight) => {
  return insight.save();
};
