import appClient from "../../../services/appClient";

export const getMyProfile = async () => {
  const response = await appClient.get("/profile/me");
  return response.data.data;
};

export const updateMyProfile = async (payload) => {
  const response = await appClient.patch("/profile/me", payload);
  return response.data.data;
};

export const changeMyPassword = async (payload) => {
  const response = await appClient.patch("/profile/me/password", payload);
  return response.data.data;
};

export const getUsers = async (params = {}) => {
  const response = await appClient.get("/users", { params });
  return response.data.data;
};

export const getUserById = async (id) => {
  const response = await appClient.get(`/users/${id}`);
  return response.data.data;
};

export const createUser = async (payload) => {
  const response = await appClient.post("/users", payload);
  return response.data.data;
};

export const updateUser = async (id, payload) => {
  const response = await appClient.patch(`/users/${id}`, payload);
  return response.data.data;
};

export const disableUser = async (id) => {
  const response = await appClient.patch(`/users/${id}/disable`);
  return response.data.data;
};

export const enableUser = async (id) => {
  const response = await appClient.patch(`/users/${id}/enable`);
  return response.data.data;
};

export const resetUserPassword = async (id, payload) => {
  const response = await appClient.patch(`/users/${id}/reset-password`, payload);
  return response.data.data;
};
