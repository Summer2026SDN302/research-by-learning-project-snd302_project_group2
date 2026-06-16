import apiClient from '../../../services/apiClient';

/**
 * GET /food-items
 * Params: { search, categoryId, isArchived, page, limit }
 */
export const getFoodItems = (params = {}) =>
  apiClient.get('/food-items', { params }).then((r) => r.data.data);
