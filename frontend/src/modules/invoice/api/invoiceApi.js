import apiClient from "@/services/apiClient";

const BASE_PATH = "/invoices";

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

export const getInvoiceById = async (id) => {
  try {
    const response = await apiClient.get(`${BASE_PATH}/${id}`);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const getInvoiceReceipt = async (id) => {
  try {
    const response = await apiClient.get(`${BASE_PATH}/${id}/receipt`);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const printInvoiceReceipt = async (id) => {
  try {
    const response = await apiClient.post(`${BASE_PATH}/${id}/print`);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};
