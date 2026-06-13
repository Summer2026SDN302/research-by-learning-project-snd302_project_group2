import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const REFRESH_TOKEN_PATH = "/auth/refresh-token";

let accessToken = null;
let isRefreshing = false;
let pendingRequests = [];

export const getAccessToken = () => accessToken;

export const setAccessToken = (token) => {
  accessToken = token || null;
};

export const clearAccessToken = () => {
  accessToken = null;
};

const appClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshAccessToken = async () => {
  const response = await axios.post(
    `${API_BASE_URL}${REFRESH_TOKEN_PATH}`,
    {},
    { withCredentials: true },
  );

  const nextAccessToken = response.data?.data?.accessToken;

  if (!nextAccessToken) {
    throw new Error("Refresh response does not include access token.");
  }

  setAccessToken(nextAccessToken);

  return nextAccessToken;
};

const resolvePendingRequests = (error, token = null) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(token);
  });

  pendingRequests = [];
};

appClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

appClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isUnauthorized = error.response?.status === 401;
    const isRefreshRequest = originalRequest?.url?.includes(REFRESH_TOKEN_PATH);

    if (!isUnauthorized || originalRequest?._retry || isRefreshRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return appClient(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const nextAccessToken = await refreshAccessToken();

      resolvePendingRequests(null, nextAccessToken);

      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;

      return appClient(originalRequest);
    } catch (refreshError) {
      clearAccessToken();
      resolvePendingRequests(refreshError);

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default appClient;
