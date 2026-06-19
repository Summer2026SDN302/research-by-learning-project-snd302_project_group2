import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import useAppToast from "../../../hooks/useAppToast";
import { getApiErrorMsg } from "../../../utils/errorUtils";
import { AUTH_ERROR_MAP } from "../constants/authConstants";
import * as authApi from "../api/authApi";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email) => {
  const value = String(email || "").trim();

  if (!value) return "Vui lòng nhập email đã nhận OTP.";
  if (/\s/.test(value)) return "Email không được chứa khoảng trắng.";
  if (!EMAIL_PATTERN.test(value)) return "Email chưa đúng định dạng.";

  return "";
};

const validateOtp = (otp) => {
  const value = String(otp || "").trim();

  if (!value) return "Vui lòng nhập mã OTP.";
  if (!/^\d{6}$/.test(value)) return "Mã OTP phải gồm đúng 6 chữ số.";

  return "";
};

const PASSWORD_ALLOWED_REGEX = /^[\x21-\x7E]+$/;

const validatePassword = (password) => {
  if (!password) return "Vui lòng nhập mật khẩu mới.";
  if (password.length < 6 || password.trim().length < 6) {
    return "Mật khẩu mới phải có ít nhất 6 ký tự và không chỉ gồm khoảng trắng.";
  }
  if (!PASSWORD_ALLOWED_REGEX.test(password)) {
    return "Mật khẩu không được chứa dấu tiếng Việt, khoảng trắng hoặc ký tự không hợp lệ.";
  }

  return "";
};

const buildInitialForm = (email) => ({
  email,
  otp: "",
  newPassword: "",
  confirmPassword: "",
});

const useResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useAppToast();

  const emailFromQuery = useMemo(() => {
    const rawEmail = searchParams.get("email") || "";
    const clean = rawEmail.trim().toLowerCase();
    return EMAIL_PATTERN.test(clean) ? clean : "";
  }, [searchParams]);

  const [formData, setFormData] = useState(buildInitialForm(emailFromQuery));
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const nextErrors = {};

    const emailMessage = validateEmail(formData.email);
    if (emailMessage) nextErrors.email = emailMessage;

    const otpMessage = validateOtp(formData.otp);
    if (otpMessage) nextErrors.otp = otpMessage;

    const passwordMessage = validatePassword(formData.newPassword);
    if (passwordMessage) nextErrors.newPassword = passwordMessage;

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Vui lòng nhập lại mật khẩu mới.";
    } else if (formData.confirmPassword !== formData.newPassword) {
      nextErrors.confirmPassword = "Xác nhận mật khẩu chưa khớp.";
    }

    setFieldErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    let nextValue =
      name === "otp" ? value.replace(/\D/g, "").slice(0, 6) : value;

    if (typeof nextValue === "string") {
      if (name === "email") {
        nextValue = nextValue.replace(/[^\x21-\x7E]/g, "");
      }
    }

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading || !validateForm()) return;

    setIsLoading(true);
    setFormError("");

    try {
      await authApi.resetPassword({
        email: formData.email.trim().toLowerCase(),
        otp: formData.otp.trim(),
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setIsSuccess(true);
      setFormData(buildInitialForm(""));
      toast.success(
        "Đặt lại mật khẩu thành công",
        "Bạn có thể đăng nhập bằng mật khẩu mới.",
        4500,
      );
    } catch (error) {
      const rawMsg = getApiErrorMsg(
        AUTH_ERROR_MAP,
        error,
        "Không thể đặt lại mật khẩu. Vui lòng thử lại sau.",
      );
      const message = AUTH_ERROR_MAP[rawMsg] || rawMsg;
      setFormError(message);
      toast.error("Đặt lại mật khẩu thất bại", message);
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    navigate("/login", { replace: true });
  };

  const goToForgotPassword = () => {
    navigate("/forgot-password");
  };

  return {
    formData,
    fieldErrors,
    formError,
    isLoading,
    isSuccess,
    handleChange,
    handleSubmit,
    goToLogin,
    goToForgotPassword,
  };
};

export default useResetPassword;
