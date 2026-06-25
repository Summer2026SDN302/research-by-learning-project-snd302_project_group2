import apiClient from "@/services/apiClient";

const BASE_PATH = "/orders";

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

export const getOrders = async (params = {}) => {
  try {
    const response = await apiClient.get(BASE_PATH, { params });
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await apiClient.get(`${BASE_PATH}/${id}`);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const createOrder = async (body) => {
  try {
    const response = await apiClient.post(BASE_PATH, body);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const updateOrderItems = async (id, body) => {
  try {
    const response = await apiClient.patch(`${BASE_PATH}/${id}/items`, body);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const recalculateOrder = async (id, body) => {
  try {
    const response = await apiClient.patch(`${BASE_PATH}/${id}/recalculate`, body);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const cancelOrder = async (id) => {
  try {
    const response = await apiClient.patch(`${BASE_PATH}/${id}/cancel`);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};
