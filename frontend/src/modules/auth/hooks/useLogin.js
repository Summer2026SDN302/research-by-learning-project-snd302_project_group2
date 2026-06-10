import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import * as authApi from "../api/authApi";
import { authFailure, authStart, authSuccess } from "../redux/authSlice";
import { getRoleHomePath } from "../constants/authConstants";
import { setAccessToken } from "../../../services/appClient";
import useAppToast from "../../../hooks/useAppToast";

const REMEMBER_IDENTIFIER_KEY = "stallbox_remember_identifier";

const getApiErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Không thể đăng nhập. Vui lòng thử lại."
  );
};

const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useAppToast();

  const [formData, setFormData] = useState({
    identifier: localStorage.getItem(REMEMBER_IDENTIFIER_KEY) || "",
    password: "",
    rememberMe: Boolean(localStorage.getItem(REMEMBER_IDENTIFIER_KEY)),
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setFormError("");
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.identifier.trim()) {
      nextErrors.identifier = "Vui lòng nhập tên đăng nhập hoặc email.";
    }

    if (!formData.password) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    }

    setFieldErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    dispatch(authStart());
    setFormError("");

    try {
      const data = await authApi.login({
        identifier: formData.identifier.trim(),
        password: formData.password,
      });

      setAccessToken(data.accessToken);

      dispatch(
        authSuccess({
          user: data.user,
          accessToken: data.accessToken,
        }),
      );

      if (formData.rememberMe) {
        localStorage.setItem(
          REMEMBER_IDENTIFIER_KEY,
          formData.identifier.trim(),
        );
      } else {
        localStorage.removeItem(REMEMBER_IDENTIFIER_KEY);
      }

      toast.success("Đăng nhập thành công", "Chào mừng bạn quay lại StallBox.");

      const fallbackPath = getRoleHomePath(data.user?.role);
      const redirectPath = location.state?.from?.pathname || fallbackPath;

      navigate(redirectPath, { replace: true });
    } catch (error) {
      const message = getApiErrorMessage(error);
      setFormError(message);
      dispatch(authFailure(message));
      toast.error("Đăng nhập thất bại", message);
    }
  };

  return {
    formData,
    fieldErrors,
    formError,
    isLoading: false,
    handleChange,
    handleSubmit,
  };
};

export default useLogin;