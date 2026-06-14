import { useState } from "react";

import useAppToast from "../../../hooks/useAppToast";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

const validateIdentifier = (identifier) => {
  const value = String(identifier || "").trim();

  if (!value) return "Vui lòng nhập email hoặc mã nhân viên.";
  if (value.length < 3) return "Email hoặc mã nhân viên cần có ít nhất 3 ký tự.";
  if (/\s/.test(value)) return "Email hoặc mã nhân viên không được chứa khoảng trắng.";

  if (value.includes("@")) {
    if (!EMAIL_PATTERN.test(value)) return "Email chưa đúng định dạng. Ví dụ: user@stallbox.com.";
    return "";
  }

  if (!USERNAME_PATTERN.test(value)) {
    return "Mã nhân viên chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.";
  }

  return "";
};

const useForgotPassword = () => {
  const { toast } = useAppToast();

  const [identifier, setIdentifier] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [isLoading] = useState(false);

  const icon = identifier.includes("@") ? "mail" : "person";

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setIdentifier(nextValue);

    if (fieldError) {
      setFieldError(validateIdentifier(nextValue));
    }
  };

  const handleBlur = () => {
    setFieldError(validateIdentifier(identifier));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const message = validateIdentifier(identifier);
    if (message) {
      setFieldError(message);
      return;
    }

    toast.info(
      "Chưa hỗ trợ backend",
      "Backend hiện chưa có API quên mật khẩu nên màn này chỉ dựng UI trước.",
      4000,
    );
  };

  return {
    identifier,
    icon,
    fieldError,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
  };
};

export default useForgotPassword;
