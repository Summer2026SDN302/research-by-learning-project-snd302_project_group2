import apiClient from '../../../services/apiClient';

/**
 * GET /categories
 * Params: { search, isActive, page, limit }
 */
export const getCategories = (params = {}) =>
  apiClient.get('/categories', { params }).then((r) => r.data.data);
