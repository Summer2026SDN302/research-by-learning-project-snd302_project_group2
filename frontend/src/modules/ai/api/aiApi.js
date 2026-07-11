import apiClient from "../../../services/apiClient";

/**
 * POST /ai/generate-insight
 * Body: { targetDate }
 */
export const generateInsight = (targetDate) =>
  apiClient.post("/ai/generate-insight", { targetDate }).then((r) => r.data.data);

/**
 * GET /ai/insight/:targetDate
 */
export const getInsightByDate = (targetDate, version) => {
  const url = version ? `/ai/insight/${targetDate}?version=${version}` : `/ai/insight/${targetDate}`;
  return apiClient.get(url).then((r) => r.data.data);
};

/**
 * GET /ai/insight/:targetDate/versions
 */
export const getInsightVersions = (targetDate) =>
  apiClient.get(`/ai/insight/${targetDate}/versions`).then((r) => r.data.data);

/**
 * PUT /ai/insight/:insightId/forecasts
 * Body: { updates: [ { foodItemId, status } ] }
 */
export const applyForecasts = (insightId, updates) =>
  apiClient.put(`/ai/insight/${insightId}/forecasts`, { updates }).then((r) => r.data.data);

/**
 * POST /ai/pricing/recommendations
 * Body: { targetDate }
 */
export const generatePricingRecommendations = (targetDate, isManual = true) =>
  apiClient.post("/ai/pricing/recommendations", { targetDate, isManual }).then((r) => r.data.data);

/**
 * PUT /ai/pricing/recommendations/:insightId/apply
 * Body: { updates: [ { foodItemId, status } ] }
 */
export const applyPricingRecommendations = (insightId, updates) =>
  apiClient
    .put(`/ai/pricing/recommendations/${insightId}/apply`, { updates })
    .then((r) => r.data.data);
