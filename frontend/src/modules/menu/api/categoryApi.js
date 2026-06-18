import apiClient from "@/services/apiClient";

const BASE_PATH = "/categories";

const normalizeApiError = (error) => {
  if (error?.response?.data) {
    return formatApiError(error.response.data);
  }

  return {
    code: "NETWORK_ERROR",
    message: "Không thể kết nối server",
    details: [],
  };
};

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
  try{
  const params = { page, limit };
  if (search) params.search = search;
  if (isActive !== null && isActive !== undefined) params.isActive = isActive;

  const response = await apiClient.get(BASE_PATH, { params });
  return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await apiClient.get(`${BASE_PATH}/${id}`);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const createCategory = async (body) => {
  try {
    const response = await apiClient.post(BASE_PATH, body);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const updateCategory = async (id, body) => {
  try {
    const response = await apiClient.put(`${BASE_PATH}/${id}`, body);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const patchCategoryStatus = async (id, isActive) => {
  try {
    const response = await apiClient.patch(`${BASE_PATH}/${id}/status`, { isActive });
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const deleteCategory  = async (id) => {
  try {
    const response = await apiClient.patch(`${BASE_PATH}/${id}/status`, {
      isActive: false,
    });
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};
