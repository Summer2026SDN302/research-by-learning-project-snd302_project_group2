import apiClient from "@/services/apiClient";

const BASE_PATH = "/food-items";

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

export const getFoodItems = async (params = {}) => {
  const query = {};

  if (params.search) query.search = params.search;
  if (params.categoryId) query.categoryId = params.categoryId;
  if (params.isArchived !== undefined && params.isArchived !== "") {
    query.isArchived = params.isArchived;
  }
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;

  try {
    const response = await apiClient.get(BASE_PATH, { params: query });
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const fetchAllFoodItems = async (params = {}) => {
  const allItems = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await getFoodItems({
      ...params,
      page,
      limit: 50,
      isArchived: "false",
    });
    allItems.push(...(data?.items || []));
    totalPages = data?.pagination?.totalPages || 1;
    page += 1;
  }

  return allItems;
};

export const getFoodItemById = async (id) => {
  try {
    const response = await apiClient.get(`${BASE_PATH}/${id}`);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const createFoodItem = async (body) => {
  try {
    const response = await apiClient.post(BASE_PATH, body);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const updateFoodItem = async (id, body) => {
  try {
    const response = await apiClient.put(`${BASE_PATH}/${id}`, body);
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const updateFoodItemArchive = async (id, isArchived) => {
  try {
    const response = await apiClient.patch(`${BASE_PATH}/${id}/archive`, {
      isArchived,
    });
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const deleteFoodItem = async (id) => {
  try {
    const response = await apiClient.patch(`${BASE_PATH}/${id}/archive`, {
      isArchived: true,
    });
    return unwrapResponse(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};
