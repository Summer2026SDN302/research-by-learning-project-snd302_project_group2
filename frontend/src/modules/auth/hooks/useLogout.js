import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as authApi from "../api/authApi";
import { clearAuth } from "../redux/authSlice";
import { clearAccessToken } from "../../../services/apiClient";
import useAppToast from "../../../hooks/useAppToast";

const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useAppToast();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);

    try {
      await authApi.logout();
    } catch {
      // Dù backend logout lỗi, FE vẫn clear session local để tránh kẹt màn hình.
    } finally {
      clearAccessToken();
      dispatch(clearAuth());
      setIsLoading(false);
      toast.success("Đã đăng xuất", "Phiên làm việc đã kết thúc.");
      navigate("/login", { replace: true });
    }
  };

  return {
    logout,
    isLoading,
  };
};

export default useLogout;
