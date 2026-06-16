import apiClient from '../../../services/apiClient';

/** GET /daily-menu/today */
export const getTodayMenu = () =>
  apiClient.get('/daily-menu/today').then((r) => r.data.data);

/** GET /daily-menu/date/:date */
export const getMenuByDate = (date) =>
  apiClient.get(`/daily-menu/date/${date}`).then((r) => r.data.data);

/** POST /daily-menu/generate */
export const generateDailyMenu = (date) =>
  apiClient.post('/daily-menu/generate', { date }).then((r) => r.data.data);

/** PATCH /daily-menu/:menuId/items/:itemId */
export const updateDailyMenuItem = (menuId, itemId, payload) =>
  apiClient
    .patch(`/daily-menu/${menuId}/items/${itemId}`, payload)
    .then((r) => r.data.data);

/**
 * PATCH /daily-menu/:menuId/items/:itemId/apply-ai-quantity
 * Reserved for AI module — exported for use by other modules
 */
export const applyAiQuantity = (menuId, itemId, payload) =>
  apiClient
    .patch(`/daily-menu/${menuId}/items/${itemId}/apply-ai-quantity`, payload)
    .then((r) => r.data.data);

/**
 * PATCH /daily-menu/:menuId/items/:itemId/apply-ai-price
 * Reserved for AI module — exported for use by other modules
 */
export const applyAiPrice = (menuId, itemId, payload) =>
  apiClient
    .patch(`/daily-menu/${menuId}/items/${itemId}/apply-ai-price`, payload)
    .then((r) => r.data.data);

/** POST /daily-menu/:menuId/items */
export const addFoodItemToDailyMenu = (menuId, foodItemId) =>
  apiClient
    .post(`/daily-menu/${menuId}/items`, { foodItemId })
    .then((r) => r.data.data);

/** DELETE /daily-menu/:menuId/items/:itemId */
export const removeFoodItemFromDailyMenu = (menuId, itemId) =>
  apiClient
    .delete(`/daily-menu/${menuId}/items/${itemId}`)
    .then((r) => r.data.data);
