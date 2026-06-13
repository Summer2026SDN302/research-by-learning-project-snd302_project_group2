import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import useAppToast from "../../../hooks/useAppToast";
import { clearAccessToken } from "../../../services/appClient";
import { clearAuth } from "../../auth/redux/authSlice";
import * as userApi from "../api/userApi";

const initialForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const getApiErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || error?.message || fallback;
};

const useChangePassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useAppToast();

  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.currentPassword) {
      nextErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại.";
    }

    if (!formData.newPassword) {
      nextErrors.newPassword = "Vui lòng nhập mật khẩu mới.";
    } else if (formData.newPassword.length < 6 || formData.newPassword.trim().length < 6) {
      nextErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự và không chỉ gồm khoảng trắng.";
    }

    if (formData.confirmPassword !== formData.newPassword) {
      nextErrors.confirmPassword = "Xác nhận mật khẩu không khớp.";
    }

    if (formData.currentPassword && formData.currentPassword === formData.newPassword) {
      nextErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading || !validateForm()) return;

    setIsLoading(true);

    try {
      await userApi.changeMyPassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      toast.success(
        "Đổi mật khẩu thành công",
        "Vui lòng đăng nhập lại bằng mật khẩu mới.",
        4500,
      );

      clearAccessToken();
      dispatch(clearAuth());
      navigate("/login", { replace: true });
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Không thể đổi mật khẩu. Vui lòng thử lại.",
      );
      setFormError(message);
      toast.error("Đổi mật khẩu thất bại", message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    fieldErrors,
    formError,
    isLoading,
    handleChange,
    handleSubmit,
  };
};

export default useChangePassword;
