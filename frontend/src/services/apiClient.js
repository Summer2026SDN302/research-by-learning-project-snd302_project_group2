import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data;

    if (payload) {
      return Promise.reject({
        code: payload.error?.code ?? "API_ERROR",
        message: payload.message ?? "Đã xảy ra lỗi",
        details: payload.error?.details ?? [],
      });
    }

    const isNetworkError =
      error.code === "ERR_NETWORK" || error.message === "Network Error";

    return Promise.reject({
      code: isNetworkError ? "NETWORK_ERROR" : "UNKNOWN_ERROR",
      message: isNetworkError
        ? "Không thể kết nối backend. Hãy chạy server tại localhost:5000 và khởi động lại npm run dev."
        : error.message ?? "Đã xảy ra lỗi",
      details: [],
    });
  },
);

export default apiClient;
