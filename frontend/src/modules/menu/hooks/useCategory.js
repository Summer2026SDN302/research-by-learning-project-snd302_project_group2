import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import useAppToast from "@/hooks/useAppToast";
import {
  CATEGORY_ERROR_MESSAGES,
  DEFAULT_PAGE_SIZE,
} from "../constants/categoryConstants";
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
} from "../redux/categorySlice";

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
    setServerFieldError(null);
  };

  const confirmDiscardChanges = () => {
    setShowUnsavedDialog(false);
    pendingCloseRef.current = false;
    setModalMode(null);
    dispatch(clearSelectedCategory());
    dispatch(resetMutationStatus());
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
      toast.error("Lỗi", err?.message ?? "Đã xảy ra lỗi");
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      await dispatch(
        toggleCategoryStatus({
          id: category._id,
          isActive: !category.isActive,
        }),
      ).unwrap();
      toast.success("Thành công", "Cập nhật trạng thái thành công");
    } catch (err) {
      toast.error("Lỗi", err?.message ?? "Không thể cập nhật trạng thái");
    }
  };

  const isEmpty = useMemo(
    () => !isLoading && !error && pagination.total === 0 && !searchKeyword.trim(),
    [isLoading, error, pagination.total, searchKeyword],
  );

  const emptyTitle = useMemo(
    () => (searchKeyword.trim() ? "Không tìm thấy danh mục" : "Chưa có danh mục nào"),
    [searchKeyword],
  );

  const emptyMessage = useMemo(
    () =>
      searchKeyword.trim()
        ? "Không tìm thấy danh mục phù hợp."
        : "Chưa có danh mục nào.",
    [searchKeyword],
  );

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
    isEmpty,
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
  };
};

export default useCategory;
