const mapUser = (user) => {
  if (!user) return null;
  if (user.username) {
    return {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    };
  }
  return { _id: user };
};

/**
 * Extracts a plain string ID from either a populated Mongoose document or a raw ObjectId.
 * Needed because after populate(), foodItemId becomes a full object {_id, name, ...}
 * instead of a plain ObjectId — the frontend must receive a plain string so it can
 * send it back to the backend validator as a valid MongoDB ObjectId.
 */
const resolveId = (ref) => {
  if (!ref) return null;
  if (ref._id) return ref._id.toString();
  return ref.toString();
};


export const toForecastResponse = (forecast) => {
  if (!forecast) return null;
  return {
    foodItemId: resolveId(forecast.foodItemId),
    name: forecast.name,
    categoryName: forecast.foodItemId?.categoryId?.name || "Khác",
    predictedDemand: forecast.predictedDemand,
    recommendedQuantity: forecast.recommendedQuantity,
    status: forecast.status,
    appliedBy: mapUser(forecast.appliedBy),
    appliedAt: forecast.appliedAt,
    rejectedBy: mapUser(forecast.rejectedBy),
    rejectedAt: forecast.rejectedAt,
  };
};


export const toPricingRecommendationResponse = (rec) => {
  if (!rec) return null;
  return {
    foodItemId: resolveId(rec.foodItemId),
    name: rec.name,
    currentRemaining: rec.currentRemaining,
    originalPrice: rec.originalPrice,
    recommendedPrice: rec.recommendedPrice,
    recommendedDiscountPercentage: rec.recommendedDiscountPercentage,
    reason: rec.reason,
    status: rec.status,
    appliedBy: mapUser(rec.appliedBy),
    appliedAt: rec.appliedAt,
    rejectedBy: mapUser(rec.rejectedBy),
    rejectedAt: rec.rejectedAt,
  };
};


export const toAiInsightResponse = (doc) => {
  if (!doc) return null;
  return {
    _id: doc._id,
    targetDate: doc.targetDate,
    version: doc.version,
    forecasts: (doc.forecasts || []).map(toForecastResponse),
    pricingRecommendations: (doc.pricingRecommendations || []).map(toPricingRecommendationResponse),
    metrics: doc.metrics,
    generatedAt: doc.generatedAt,
  };
};
