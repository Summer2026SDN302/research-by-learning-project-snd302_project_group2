import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import useAppToast from "../../../hooks/useAppToast";
import { getApiErrorMsg } from "../../../utils/errorUtils";
import { USER_ERROR_MAP } from "../constants/userConstants";
import { updateAuthUser } from "../../auth/redux/authSlice";
import * as userApi from "../api/userApi";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+()\s.-]{8,20}$/;

const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

const toProfileForm = (user) => ({
  fullName: user?.fullName || "",
  email: user?.email || "",
  phone: user?.phone || "",
});

const useProfile = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();
  const authUser = useSelector((state) => state.auth.user);

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const currentUser = profile || authUser;
  const [formData, setFormData] = useState(toProfileForm(currentUser));
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let isCancelled = false;

    const loadProfile = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await userApi.getMyProfile();
        if (isCancelled) return;

        setProfile(data);
        setFormData(toProfileForm(data));
        dispatch(updateAuthUser(data));
      } catch (loadError) {
        if (isCancelled) return;
        if (loadError?.response?.status === 401) return;

<<<<<<< HEAD
        const message = getApiErrorMessage(
          loadError,
          "Không thể tải hồ sơ cá nhân.",
        );
=======
        const rawMsg = getApiErrorMsg(USER_ERROR_MAP, loadError, "Không thể tải hồ sơ cá nhân.");
        const message = USER_ERROR_MAP[rawMsg] || rawMsg;
>>>>>>> 2cd518f (Fix lỗi UI auth)
        setError(message);
        toast.error("Tải hồ sơ thất bại", message);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [dispatch, toast]);

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Vui lòng nhập họ tên.";
    } else if (formData.fullName.trim().length < 2) {
      nextErrors.fullName = "Họ tên cần có ít nhất 2 ký tự.";
    } else if (formData.fullName.trim().length > 120) {
      nextErrors.fullName = "Họ tên không được vượt quá 120 ký tự.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Vui lòng nhập email.";
    } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
      nextErrors.email = "Email chưa đúng định dạng. Ví dụ: user@stallbox.com.";
    }

    if (formData.phone.trim() && !PHONE_PATTERN.test(formData.phone.trim())) {
      nextErrors.phone =
        "Số điện thoại chỉ nên gồm 8–20 ký tự: số, +, (), dấu cách hoặc dấu gạch.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (typeof nextValue === "string") {
      if (name === "email") {
        nextValue = nextValue.replace(/[^\x21-\x7E]/g, "");
      } else if (name === "phone") {
        nextValue = nextValue.replace(/[^0-9+\-()\s]/g, "");
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving || !validateForm()) return;

    setIsSaving(true);
    setError("");

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
      };

      const data = await userApi.updateMyProfile(payload);

      setProfile(data);
      dispatch(updateAuthUser(data));
      toast.success("Đã cập nhật hồ sơ", "Thông tin cá nhân đã được lưu.");
    } catch (submitError) {
      if (submitError?.response?.status === 401) return;
      const rawMsg = getApiErrorMsg(
        USER_ERROR_MAP,
        submitError,
        "Không thể cập nhật hồ sơ. Vui lòng thử lại.",
      );
      const message = USER_ERROR_MAP[rawMsg] || rawMsg;
      setError(message);
      toast.error("Cập nhật thất bại", message);
    } finally {
      setIsSaving(false);
    }
  };

  const displayUser = useMemo(() => {
    const name = currentUser?.fullName || currentUser?.username || "Người dùng";

    return {
      ...currentUser,
      displayName: name,
      initials: getInitials(name),
      statusLabel: currentUser?.isActive ? "Đang hoạt động" : "Tạm khóa",
    };
  }, [currentUser]);

  return {
    user: displayUser,
    formData,
    fieldErrors,
    error,
    isLoading,
    isSaving,
    handleChange,
    handleSubmit,
  };
};

export default useProfile;
