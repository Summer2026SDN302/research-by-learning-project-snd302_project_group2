import apiClient from "../../../services/apiClient";

export const login = async (payload) => {
  const response = await apiClient.post("/auth/login", payload);
  return response.data.data;
};

export const refreshToken = async () => {
  const response = await apiClient.post("/auth/refresh-token");
  return response.data.data;
};

export const logout = async () => {
  const response = await apiClient.post("/auth/logout");
  return response.data.data;
};

export const forgotPassword = async (payload) => {
  const response = await apiClient.post("/auth/forgot-password", payload);
  return response.data.data;
};

export const resetPassword = async (payload) => {
  const response = await apiClient.post("/auth/reset-password", payload);
  return response.data.data;
};
