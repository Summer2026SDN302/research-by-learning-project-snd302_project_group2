import appClient from "../../../services/appClient";

export const login = async (payload) => {
  const response = await appClient.post("/auth/login", payload);
  return response.data.data;
};

export const refreshToken = async () => {
  const response = await appClient.post("/auth/refresh-token");
  return response.data.data;
};

export const logout = async () => {
  const response = await appClient.post("/auth/logout");
  return response.data.data;
};

export const getProfile = async () => {
  const response = await appClient.get("/profile/me");
  return response.data.data;
};