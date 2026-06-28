import apiClient from "@/services/apiClient";

const BASE_PATH = "/payments";

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

export const getPaymentById = async (id) => {
  try {
    const response = await apiClient.get(`${BASE_PATH}/${id}`);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const getPaymentReceipt = async (id) => {
  try {
    const response = await apiClient.get(`${BASE_PATH}/${id}/receipt`);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const initiatePayment = async (body) => {
  try {
    const response = await apiClient.post(BASE_PATH, body);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const checkoutPayment = async (body) => {
  try {
    const response = await apiClient.post(`${BASE_PATH}/checkout`, body);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const confirmPayment = async (id, body) => {
  try {
    const response = await apiClient.patch(`${BASE_PATH}/${id}/confirm`, body);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const failPayment = async (id, body) => {
  try {
    const response = await apiClient.patch(`${BASE_PATH}/${id}/fail`, body);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const printPaymentReceipt = async (id) => {
  try {
    const response = await apiClient.post(`${BASE_PATH}/${id}/print`);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const getPayments = async (params = {}) => {
  try {
    const response = await apiClient.get(BASE_PATH, { params });
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};
