import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import * as authApi from "../api/authApi";
import { authFailure, authStart, authSuccess } from "../redux/authSlice";
import { getRoleHomePath, AUTH_ERROR_MAP } from "../constants/authConstants";
import { setAccessToken } from "../../../services/apiClient";
import useAppToast from "../../../hooks/useAppToast";
import { getApiErrorMsg } from "../../../utils/errorUtils";

const REMEMBER_IDENTIFIER_KEY = "stallbox_remember_identifier";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

const normalizeIdentifier = (value = "") => String(value).trim();

const validateIdentifier = (identifier) => {
  const value = normalizeIdentifier(identifier);

  if (!value) return "Vui lòng nhập tên đăng nhập hoặc email.";
  if (value.length < 3) return "Tên đăng nhập hoặc email cần có ít nhất 3 ký tự.";
  if (value.length > 80) return "Tên đăng nhập hoặc email không được vượt quá 80 ký tự.";
  if (/\s/.test(value)) return "Tên đăng nhập hoặc email không được chứa khoảng trắng.";

  if (value.includes("@")) {
    if (!EMAIL_PATTERN.test(value)) return "Email chưa đúng định dạng. Ví dụ: user@stallbox.com.";
    return "";
  }

  if (!USERNAME_PATTERN.test(value)) {
    return "Tên đăng nhập chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.";
  }

  return "";
};

const PASSWORD_ALLOWED_REGEX = /^[\x21-\x7E]+$/;

const validatePassword = (password) => {
  if (!password) return "Vui lòng nhập mật khẩu.";
  if (!PASSWORD_ALLOWED_REGEX.test(password)) {
    return "Mật khẩu không được chứa dấu tiếng Việt, khoảng trắng hoặc ký tự không hợp lệ.";
  }
  return "";
};

const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useAppToast();

  const isLoading = useSelector((state) => state.auth.isLoading);

  const [formData, setFormData] = useState({
    identifier: localStorage.getItem(REMEMBER_IDENTIFIER_KEY) || "",
    password: "",
    rememberMe: Boolean(localStorage.getItem(REMEMBER_IDENTIFIER_KEY)),
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(() =>
    searchParams.get("reason") === "session_expired"
      ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
      : ""
  );

  useEffect(() => {
    if (searchParams.get("reason") === "session_expired") {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const validateField = (name, value) => {
    if (name === "identifier") return validateIdentifier(value);
    if (name === "password") return validatePassword(value);
    return "";
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    let nextValue = type === "checkbox" ? checked : value;

    if (typeof nextValue === "string") {
      if (name === "password" || name === "identifier") {
        // Strip non-ASCII characters (which includes Vietnamese accented characters) and spaces
        nextValue = nextValue.replace(/[^\x21-\x7E]/g, "");
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: prev[name] ? validateField(name, nextValue) : "",
    }));

    setFormError("");
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    const message = validateField(name, value);

    setFieldErrors((prev) => ({
      ...prev,
      [name]: message,
    }));
  };

  const validateForm = () => {
    const nextErrors = {
      identifier: validateIdentifier(formData.identifier),
      password: validatePassword(formData.password),
    };

    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key]) delete nextErrors[key];
    });

    setFieldErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) return;
    if (!validateForm()) return;

    dispatch(authStart());
    setFormError("");

    try {
      const data = await authApi.login({
        identifier: normalizeIdentifier(formData.identifier),
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
          normalizeIdentifier(formData.identifier),
        );
      } else {
        localStorage.removeItem(REMEMBER_IDENTIFIER_KEY);
      }

      toast.success("Đăng nhập thành công", "Chào mừng bạn quay lại StallBox.");

      const fallbackPath = getRoleHomePath(data.user?.role);
      const redirectPath = location.state?.from?.pathname || fallbackPath;

      navigate(redirectPath, { replace: true });
    } catch (error) {
      const rawMsg = getApiErrorMsg(AUTH_ERROR_MAP, error, "Tên đăng nhập hoặc mật khẩu không đúng.");
      const message = AUTH_ERROR_MAP[rawMsg] || rawMsg;

      setFormError(message);
      dispatch(authFailure(message));
      toast.error("Đăng nhập thất bại", message);
    }
  };

  return {
    formData,
    fieldErrors,
    formError,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
  };
};

export default useLogin;
