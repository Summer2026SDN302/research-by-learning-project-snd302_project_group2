import { useState } from "react";
import { useNavigate } from "react-router-dom";

import useAppToast from "../../../hooks/useAppToast";
import { getApiErrorMessage } from "../../../utils/apiErrorMessage";
import * as authApi from "../api/authApi";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email) => {
  const value = String(email || "").trim();

  if (!value) return "Vui lòng nhập email đã đăng ký.";
  if (/\s/.test(value)) return "Email không được chứa khoảng trắng.";
  if (!EMAIL_PATTERN.test(value)) {
    return "Email chưa đúng định dạng. Ví dụ: user@stallbox.com.";
  }

  return "";
};

const useForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useAppToast();

  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();

  const handleChange = (event) => {
    const nextValue = event.target.value;

    setEmail(nextValue);
    setFormError("");
    setIsSubmitted(false);

    if (fieldError) {
      setFieldError(validateEmail(nextValue));
    }
  };

  const handleBlur = () => {
    setFieldError(validateEmail(email));
  };

  const goToResetPassword = () => {
    navigate(`/reset-password?email=${encodeURIComponent(normalizedEmail)}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) return;

    const message = validateEmail(email);
    if (message) {
      setFieldError(message);
      return;
    }

    setIsLoading(true);
    setFormError("");

    try {
      await authApi.forgotPassword({ email: normalizedEmail });
      setIsSubmitted(true);
      toast.success(
        "Đã gửi mã OTP",
        "Vui lòng kiểm tra hộp thư đến hoặc thư rác rồi nhập mã để đặt lại mật khẩu.",
        4500,
      );
    } catch (error) {
      const friendlyMessage = getApiErrorMessage(
        error,
        "Không thể gửi mã OTP. Vui lòng thử lại sau.",
      );
      setFormError(friendlyMessage);
      toast.error("Gửi OTP thất bại", friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    normalizedEmail,
    fieldError,
    formError,
    isLoading,
    isSubmitted,
    handleChange,
    handleBlur,
    handleSubmit,
    goToResetPassword,
  };
};

export default useForgotPassword;