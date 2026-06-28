import apiClient from "@/services/apiClient";

const BASE_PATH = "/orders";

const formatApiError = (responseData) => {
  const error = responseData?.error ?? {};
  return {
    code: error.code ?? "UNKNOWN_ERROR",
    message: responseData?.message ?? "Da xay ra loi",
    details: error.details ?? [],
  };
};

const normalizeApiError = (error) => {
  if (error?.response?.data) {
    return formatApiError(error.response.data);
  }

  return {
    code: "NETWORK_ERROR",
    message: "Khong the ket noi server",
    details: [],
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

export const getMyOrders = async (params = {}) => {
  try {
    const response = await apiClient.get(`${BASE_PATH}/my-orders`, { params });
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

export const updateOrderStatus = async (id, orderStatus) => {
  try {
    const response = await apiClient.patch(`${BASE_PATH}/${id}/status`, {
      orderStatus,
    });
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};
