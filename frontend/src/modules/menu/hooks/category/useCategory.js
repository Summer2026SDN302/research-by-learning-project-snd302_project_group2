import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import useAppToast from "@/hooks/useAppToast";
import { getApiErrorMsg } from "@/utils/errorUtils";
import {
  CATEGORY_ERROR_MESSAGES,
  DEFAULT_PAGE_SIZE,
} from "../../constants/categoryConstants";
import {
  clearError,
  clearSelectedCategory,
  createCategory,
  fetchCategories,
  fetchCategoryById,
  resetMutationStatus,
  setFilters,
  toggleCategoryStatus,
  updateCategory,
} from "../../redux/categorySlice";

const buildPayload = (data) => ({
  name: data.name.trim(),
  description: data.description?.trim() || undefined,
  icon: data.icon,
});

export const useCategory = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  const {
    items,
    pagination,
    filters,
    selectedCategory,
    listStatus,
    mutationStatus,
    error,
  } = useSelector((state) => state.category);

  const [searchKeyword, setSearchKeyword] = useState(filters.search ?? "");
  const [modalMode, setModalMode] = useState(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [serverFieldError, setServerFieldError] = useState(null);
  const [statusConfirmTarget, setStatusConfirmTarget] = useState(null);

  const pendingCloseRef = useRef(false);
  const debouncedSearch = useDebouncedValue(searchKeyword);

  const isLoading = listStatus === "loading";
  const isMutating = mutationStatus === "loading";

  const loadCategories = useCallback(
    (overrides = {}) => {
      dispatch(
        fetchCategories({
          search: overrides.search ?? filters.search,
          page: overrides.page ?? pagination.page,
          limit: overrides.limit ?? pagination.limit ?? DEFAULT_PAGE_SIZE,
          isActive: overrides.isActive ?? filters.isActive,
        }),
      );
    },
    [dispatch, filters.search, filters.isActive, pagination.page, pagination.limit],
  );

  useEffect(() => {
    dispatch(setFilters({ search: debouncedSearch }));
    dispatch(
      fetchCategories({
        search: debouncedSearch,
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        isActive: filters.isActive,
      }),
    );
  }, [debouncedSearch, dispatch, filters.isActive]);

  const handleSearchChange = (value) => {
    setSearchKeyword(value);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    loadCategories({ page: newPage, search: debouncedSearch });
  };

  const openCreateModal = () => {
    dispatch(clearSelectedCategory());
    dispatch(clearError());
    setServerFieldError(null);
    setModalMode("create");
  };

  const openEditModal = async (category) => {
    dispatch(clearError());
    setServerFieldError(null);
    setModalMode("edit");
    await dispatch(fetchCategoryById(category._id));
  };

  const closeModal = (isDirty = false) => {
    if (isDirty) {
      pendingCloseRef.current = true;
      setShowUnsavedDialog(true);
      return;
    }
    setModalMode(null);
    dispatch(clearSelectedCategory());
    dispatch(resetMutationStatus());
    dispatch(clearError());
    setServerFieldError(null);
  };

  const confirmDiscardChanges = () => {
    setShowUnsavedDialog(false);
    pendingCloseRef.current = false;
    setModalMode(null);
    dispatch(clearSelectedCategory());
    dispatch(resetMutationStatus());
    dispatch(clearError());
    setServerFieldError(null);
  };

  const cancelDiscardChanges = () => {
    setShowUnsavedDialog(false);
    pendingCloseRef.current = false;
  };

  const submitForm = async (data) => {
    dispatch(clearError());
    setServerFieldError(null);

    const payload = buildPayload(data);

    try {
      if (modalMode === "create") {
        await dispatch(createCategory(payload)).unwrap();
        toast.success("Thành công", "Tạo danh mục thành công");
      } else if (modalMode === "edit" && selectedCategory?._id) {
        await dispatch(
          updateCategory({ id: selectedCategory._id, body: payload }),
        ).unwrap();
        toast.success("Thành công", "Cập nhật danh mục thành công");
      }

      setModalMode(null);
      dispatch(clearSelectedCategory());
      loadCategories({ search: debouncedSearch, page: pagination.page });
    } catch (err) {
      if (err?.code === "CATEGORY_NAME_EXISTS") {
        setServerFieldError({
          field: "name",
          message: CATEGORY_ERROR_MESSAGES.CATEGORY_NAME_EXISTS,
        });
      }
      toast.error("Lỗi", getApiErrorMsg(CATEGORY_ERROR_MESSAGES, { response: { data: { error: { code: err?.code }, message: err?.message } } }, "Đã xảy ra lỗi"));
    }
  };

  const handleToggleStatus = (category) => {
    setStatusConfirmTarget(category);
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusConfirmTarget) return;
    const category = statusConfirmTarget;
    setStatusConfirmTarget(null);
    dispatch(clearError());
    try {
      await dispatch(
        toggleCategoryStatus({
          id: category._id,
          isActive: !category.isActive,
        }),
      ).unwrap();
      toast.success("Thành công", "Cập nhật trạng thái thành công");
    } catch (err) {
      toast.error("Lỗi", getApiErrorMsg(CATEGORY_ERROR_MESSAGES, { response: { data: { error: { code: err?.code }, message: err?.message } } }, "Không thể cập nhật trạng thái"));
    }
  };

  const handleCancelToggleStatus = () => {
    setStatusConfirmTarget(null);
  };

  const filterBarConfig = useMemo(
    () => [
      {
        key: "isActive",
        label: "Trạng thái",
        options: [
          { value: "", label: "Tất cả trạng thái" },
          { value: "true", label: "Đang hoạt động" },
          { value: "false", label: "Ngừng hoạt động" },
        ],
      },
    ],
    [],
  );

  const filterValues = useMemo(
    () => ({
      isActive: filters.isActive === null ? "" : String(filters.isActive),
    }),
    [filters.isActive],
  );

  const handleFilterChange = useCallback(
    (key, value) => {
      if (key === "isActive") {
        const isActive = value === "" ? null : value === "true";
        dispatch(setFilters({ isActive }));
      }
    },
    [dispatch],
  );

  const handleFilterReset = useCallback(() => {
    dispatch(setFilters({ isActive: null }));
  }, [dispatch]);

  const hasActiveFilters = useMemo(
    () => Boolean(searchKeyword.trim()) || filters.isActive !== null,
    [filters.isActive, searchKeyword],
  );

  const isEmpty = useMemo(
    () => !isLoading && !error && pagination.total === 0 && !searchKeyword.trim(),
    [isLoading, error, pagination.total, searchKeyword],
  );

  const isEmptyState = useMemo(
    () => !isLoading && !error && pagination.total === 0 && !hasActiveFilters,
    [hasActiveFilters, isLoading, error, pagination.total],
  );

  const emptyTitle = useMemo(
    () => (hasActiveFilters ? "Không tìm thấy danh mục" : "Chưa có danh mục nào"),
    [hasActiveFilters],
  );

  const emptyMessage = useMemo(
    () =>
      hasActiveFilters
        ? "Không tìm thấy danh mục phù hợp."
        : "Chưa có danh mục nào.",
    [hasActiveFilters],
  );

  const errorMsg = useMemo(() => {
    if (!error) return null;
    return getApiErrorMsg(
      CATEGORY_ERROR_MESSAGES,
      { response: { data: { error: { code: error?.code }, message: error?.message } } },
      "Đã xảy ra lỗi"
    );
  }, [error]);

  const errorTitle = useMemo(() => {
    if (!error) return null;
    if (listStatus === "failed") {
      return "Không tải được danh sách danh mục";
    }
    return "Lỗi thực hiện thao tác";
  }, [listStatus, error]);

  return {
    categories: items,
    pagination,
    isLoading,
    isMutating,
    searchKeyword,
    modalMode,
    selectedCategory,
    showUnsavedDialog,
    serverFieldError,
    error,
    errorMsg,
    errorTitle,
    isEmpty,
    isEmptyState,
    hasActiveFilters,
    filterBarConfig,
    filterValues,
    handleFilterChange,
    handleFilterReset,
    emptyTitle,
    emptyMessage,
    handleSearchChange,
    handlePageChange,
    openCreateModal,
    openEditModal,
    closeModal,
    confirmDiscardChanges,
    cancelDiscardChanges,
    submitForm,
    handleToggleStatus,
    statusConfirmTarget,
    handleConfirmToggleStatus,
    handleCancelToggleStatus,
  };
};

export default useCategory;
