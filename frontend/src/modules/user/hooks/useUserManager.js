import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import useAppToast from "../../../hooks/useAppToast";
import { getApiErrorMessage } from "../../../utils/apiErrorMessage";
import * as userApi from "../api/userApi";
import {
  DEFAULT_RESET_PASSWORD_FORM,
  DEFAULT_USER_FORM,
} from "../constants/userConstants";

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const DEFAULT_STATS = {
  total: 0,
  active: 0,
  inactive: 0,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+()\s.-]{8,20}$/;

const toUserForm = (user) => ({
  username: user?.username || "",
  password: "",
  fullName: user?.fullName || "",
  email: user?.email || "",
  phone: user?.phone || "",
  role: user?.role || DEFAULT_USER_FORM.role,
});

const buildPayload = (formData, mode) => {
  const payload = {
    username: formData.username.trim(),
    fullName: formData.fullName.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim() || null,
    role: formData.role,
  };

  if (mode === "create") {
    payload.password = formData.password;
  }

  return payload;
};

const useUserManager = () => {
  const { toast } = useAppToast();
  const authUser = useSelector((state) => state.auth.user);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSaving, setUsersSaving] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [stats, setStats] = useState(DEFAULT_STATS);

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    isActive: "",
    page: 1,
    limit: 10,
  });

  const [formMode, setFormMode] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_USER_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  const [statusAction, setStatusAction] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [resetPasswordForm, setResetPasswordForm] = useState(
    DEFAULT_RESET_PASSWORD_FORM,
  );
  const [resetPasswordErrors, setResetPasswordErrors] = useState({});

  const queryParams = useMemo(() => {
    const params = {
      page: filters.page,
      limit: filters.limit,
    };

    if (filters.search.trim()) params.search = filters.search.trim();
    if (filters.role) params.role = filters.role;
    if (filters.isActive !== "") params.isActive = filters.isActive;

    return params;
  }, [filters]);

  const fetchStats = async () => {
    try {
      const [totalData, activeData, inactiveData] = await Promise.all([
        userApi.getUsers({ page: 1, limit: 1 }),
        userApi.getUsers({ page: 1, limit: 1, isActive: true }),
        userApi.getUsers({ page: 1, limit: 1, isActive: false }),
      ]);

      setStats({
        total: totalData?.pagination?.total || 0,
        active: activeData?.pagination?.total || 0,
        inactive: inactiveData?.pagination?.total || 0,
      });
    } catch {
      // Stats chỉ là phụ trợ, lỗi chính sẽ hiển thị ở list.
    }
  };

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError("");

    try {
      const data = await userApi.getUsers(queryParams);
      setUsers(data?.items || []);
      setPagination({
        ...DEFAULT_PAGINATION,
        ...(data?.pagination || {}),
      });
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Không thể tải danh sách người dùng.",
      );
      setUsersError(message);
      toast.error("Tải người dùng thất bại", message);
    } finally {
      setUsersLoading(false);
    }
  }, [queryParams, toast]);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => {
        fetchUsers();
      },
      filters.search ? 300 : 0,
    );

    return () => window.clearTimeout(timeoutId);
  }, [fetchUsers, filters.search]);

  useEffect(() => {
    let isCancelled = false;

    const loadStats = async () => {
      try {
        const [totalData, activeData, inactiveData] = await Promise.all([
          userApi.getUsers({ page: 1, limit: 1 }),
          userApi.getUsers({ page: 1, limit: 1, isActive: true }),
          userApi.getUsers({ page: 1, limit: 1, isActive: false }),
        ]);

        if (isCancelled) return;

        setStats({
          total: totalData?.pagination?.total || 0,
          active: activeData?.pagination?.total || 0,
          inactive: inactiveData?.pagination?.total || 0,
        });
      } catch {
        // Stats chỉ là phụ trợ, lỗi chính sẽ hiển thị ở list.
      }
    };

    loadStats();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleSearchChange = (event) => {
    setFilters((prev) => ({ ...prev, search: event.target.value, page: 1 }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters((prev) => ({
      ...prev,
      search: "",
      role: "",
      isActive: "",
      page: 1,
    }));
  };

  const handlePageChange = (page) => {
    if (page < 1 || page === pagination.page || page > pagination.totalPages)
      return;
    setFilters((prev) => ({ ...prev, page }));
  };

  const openCreateForm = () => {
    setFormMode("create");
    setSelectedUser(null);
    setFormData(DEFAULT_USER_FORM);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (user) => {
    setFormMode("edit");
    setSelectedUser(user);
    setFormData(toUserForm(user));
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (usersSaving) return;
    setIsFormOpen(false);
    setSelectedUser(null);
    setFieldErrors({});
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateUserForm = () => {
    const nextErrors = {};

    if (!formData.username.trim()) {
      nextErrors.username = "Vui lòng nhập tên đăng nhập.";
    } else if (formData.username.trim().length < 4) {
      nextErrors.username = "Tên đăng nhập phải có ít nhất 4 ký tự.";
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username.trim())) {
      nextErrors.username =
        "Tên đăng nhập chỉ gồm chữ, số, dấu chấm, gạch dưới và gạch ngang.";
    }

    if (formMode === "create") {
      if (!formData.password) {
        nextErrors.password = "Vui lòng nhập mật khẩu.";
      } else if (
        formData.password.length < 6 ||
        formData.password.trim().length < 6
      ) {
        nextErrors.password =
          "Mật khẩu phải có ít nhất 6 ký tự và không chỉ gồm khoảng trắng.";
      }
    }

    if (!formData.fullName.trim())
      nextErrors.fullName = "Vui lòng nhập họ tên.";

    if (!formData.email.trim()) {
      nextErrors.email = "Vui lòng nhập email.";
    } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
      nextErrors.email = "Email chưa đúng định dạng. Ví dụ: user@stallbox.com.";
    }

    if (formData.phone.trim() && !PHONE_PATTERN.test(formData.phone.trim())) {
      nextErrors.phone =
        "Số điện thoại chỉ nên gồm 8–20 ký tự: số, +, (), dấu cách hoặc dấu gạch.";
    }

    if (!formData.role) nextErrors.role = "Vui lòng chọn vai trò.";

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmitUser = async (event) => {
    event.preventDefault();
    if (usersSaving || !validateUserForm()) return;

    setUsersSaving(true);
    setUsersError("");

    try {
      const payload = buildPayload(formData, formMode);
      if (formMode === "create") {
        await userApi.createUser(payload);
        toast.success(
          "Đã tạo người dùng",
          "Tài khoản mới đã được thêm vào hệ thống.",
        );
      } else {
        await userApi.updateUser(selectedUser._id, payload);
        toast.success(
          "Đã cập nhật người dùng",
          "Thông tin tài khoản đã được lưu.",
        );
      }

      setIsFormOpen(false);
      setSelectedUser(null);
      await fetchUsers();
      await fetchStats();
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        formMode === "create"
          ? "Không thể tạo người dùng."
          : "Không thể cập nhật người dùng.",
      );
      setUsersError(message);
      toast.error("Lưu người dùng thất bại", message);
    } finally {
      setUsersSaving(false);
    }
  };

  const openStatusAction = (user) =>
    setStatusAction({ user, nextActive: !user.isActive });

  const closeStatusAction = () => {
    if (usersSaving) return;
    setStatusAction(null);
  };

  const confirmStatusAction = async () => {
    if (!statusAction?.user || usersSaving) return;

    setUsersSaving(true);
    setUsersError("");

    try {
      if (statusAction.nextActive) {
        await userApi.enableUser(statusAction.user._id);
        toast.success(
          "Đã mở khóa tài khoản",
          "Người dùng có thể đăng nhập lại.",
        );
      } else {
        await userApi.disableUser(statusAction.user._id);
        toast.success(
          "Đã tạm khóa tài khoản",
          "Refresh token của người dùng đã bị thu hồi.",
        );
      }

      setStatusAction(null);
      await fetchUsers();
      await fetchStats();
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Không thể cập nhật trạng thái người dùng.",
      );
      setUsersError(message);
      toast.error("Cập nhật trạng thái thất bại", message);
    } finally {
      setUsersSaving(false);
    }
  };

  const openResetPassword = (user) => {
    setResetUser(user);
    setResetPasswordForm(DEFAULT_RESET_PASSWORD_FORM);
    setResetPasswordErrors({});
  };

  const closeResetPassword = () => {
    if (usersSaving) return;
    setResetUser(null);
    setResetPasswordErrors({});
  };

  const handleResetPasswordChange = (event) => {
    const { name, value } = event.target;
    setResetPasswordForm((prev) => ({ ...prev, [name]: value }));
    setResetPasswordErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateResetPassword = () => {
    const nextErrors = {};

    if (!resetPasswordForm.newPassword) {
      nextErrors.newPassword = "Vui lòng nhập mật khẩu mới.";
    } else if (
      resetPasswordForm.newPassword.length < 6 ||
      resetPasswordForm.newPassword.trim().length < 6
    ) {
      nextErrors.newPassword =
        "Mật khẩu mới phải có ít nhất 6 ký tự và không chỉ gồm khoảng trắng.";
    }

    if (resetPasswordForm.confirmPassword !== resetPasswordForm.newPassword) {
      nextErrors.confirmPassword = "Xác nhận mật khẩu không khớp.";
    }

    setResetPasswordErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitResetPassword = async (event) => {
    event.preventDefault();
    if (usersSaving || !resetUser || !validateResetPassword()) return;

    setUsersSaving(true);
    setUsersError("");

    try {
      await userApi.resetUserPassword(resetUser._id, resetPasswordForm);
      toast.success(
        "Đã đặt lại mật khẩu",
        "Người dùng cần đăng nhập lại bằng mật khẩu mới.",
      );
      setResetUser(null);
      await fetchUsers();
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Không thể đặt lại mật khẩu người dùng.",
      );
      setUsersError(message);
      toast.error("Đặt lại mật khẩu thất bại", message);
    } finally {
      setUsersSaving(false);
    }
  };

  const canManageUser = useCallback(
    (user) => String(user?._id) !== String(authUser?._id),
    [authUser?._id],
  );

  return {
    users,
    usersLoading,
    usersSaving,
    usersError,
    pagination,
    stats,
    filters,
    formMode,
    selectedUser,
    isFormOpen,
    formData,
    fieldErrors,
    statusAction,
    resetUser,
    resetPasswordForm,
    resetPasswordErrors,
    canManageUser,
    handleSearchChange,
    handleFilterChange,
    handleResetFilters,
    handlePageChange,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormChange,
    handleSubmitUser,
    openStatusAction,
    closeStatusAction,
    confirmStatusAction,
    openResetPassword,
    closeResetPassword,
    handleResetPasswordChange,
    submitResetPassword,
  };
};

export default useUserManager;
