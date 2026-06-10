import apiClient from '../../../services/appClient';

const BASE_PATH = '/food-items';

const formatApiError = (responseData) => {
  const error = responseData?.error ?? {};
  return {
    code: error.code ?? 'UNKNOWN_ERROR',
    message: responseData?.message ?? 'Đã xảy ra lỗi',
    details: error.details ?? [],
  };
};

const unwrapResponse = (response) => {
  const payload = response.data;
  if (!payload?.success) {
    throw formatApiError(payload);
  }
  return payload.data;
};

export const getFoodItems = async (params = {}) => {
  const query = {};

  if (params.search) query.search = params.search;
  if (params.categoryId) query.categoryId = params.categoryId;
  if (params.isArchived !== undefined && params.isArchived !== '') {
    query.isArchived = params.isArchived;
  }
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;

  const response = await apiClient.get(BASE_PATH, { params: query });
  return unwrapResponse(response);
};

export const getFoodItemById = async (id) => {
  const response = await apiClient.get(`${BASE_PATH}/${id}`);
  return unwrapResponse(response);
};

export const createFoodItem = async (body) => {
  const response = await apiClient.post(BASE_PATH, body);
  return unwrapResponse(response);
};

export const updateFoodItem = async (id, body) => {
  const response = await apiClient.put(`${BASE_PATH}/${id}`, body);
  return unwrapResponse(response);
};

export const updateFoodItemArchive = async (id, isArchived) => {
  const response = await apiClient.patch(`${BASE_PATH}/${id}/archive`, { isArchived });
  return unwrapResponse(response);
};

export const deleteFoodItem = async (id) => {
  const response = await apiClient.delete(`${BASE_PATH}/${id}`);
  return unwrapResponse(response);
};