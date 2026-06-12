import apiClient from "@/services/apiClient";

const BASE_PATH = "/categories";

const formatApiError = (responseData) => {
  const error = responseData?.error ?? {};
  return {
    code: error.code ?? "UNKNOWN_ERROR",
    message: responseData?.message ?? "Đã xảy ra lỗi",
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

export const getCategories = async ({ search = "", page = 1, limit = 10, isActive } = {}) => {
  const params = { page, limit };
  if (search) params.search = search;
  if (isActive !== null && isActive !== undefined) params.isActive = isActive;

  const response = await apiClient.get(BASE_PATH, { params });
  return unwrapResponse(response);
};

export const getCategoryById = async (id) => {
  const response = await apiClient.get(`${BASE_PATH}/${id}`);
  return unwrapResponse(response);
};

export const createCategory = async (body) => {
  const response = await apiClient.post(BASE_PATH, body);
  return unwrapResponse(response);
};

export const updateCategory = async (id, body) => {
  const response = await apiClient.put(`${BASE_PATH}/${id}`, body);
  return unwrapResponse(response);
};

export const patchCategoryStatus = async (id, isActive) => {
  const response = await apiClient.patch(`${BASE_PATH}/${id}/status`, { isActive });
  return unwrapResponse(response);
};

export const deleteCategory = async (id) => {
  const response = await apiClient.delete(`${BASE_PATH}/${id}`);
  return unwrapResponse(response);
};
