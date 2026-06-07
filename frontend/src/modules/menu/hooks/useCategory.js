import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import {
  CATEGORY_ERROR_MESSAGES,
  DEFAULT_PAGE_SIZE,
} from "../constants/categoryConstants";
import {
  clearError,
  clearSelectedCategory,
  createCategory,
  deleteCategory,
  fetchCategories,
  fetchCategoryById,
  resetMutationStatus,
  setFilters,
  toggleCategoryStatus,
  updateCategory,
} from "../redux/categorySlice";

const useDebouncedValue = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

const buildPayload = (data) => ({
  name: data.name.trim(),
  description: data.description?.trim() || undefined,
  icon: data.icon,
  isActive: data.isActive,
});

export const useCategory = () => {
  const dispatch = useDispatch();
  const { showToast } = useOutletContext() ?? {};

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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
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

  const toast = useCallback(
    (message, type = "success") => {
      showToast?.({ message, type });
    },
    [showToast],
  );

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
        toast("Tạo danh mục thành công");
      } else if (modalMode === "edit" && selectedCategory?._id) {
        await dispatch(
          updateCategory({ id: selectedCategory._id, body: payload }),
        ).unwrap();
        toast("Cập nhật danh mục thành công");
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
      toast(err?.message ?? "Đã xảy ra lỗi", "error");
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
      toast("Cập nhật trạng thái thành công");
    } catch (err) {
      toast(err?.message ?? "Không thể cập nhật trạng thái", "error");
    }
  };

  const handleDeleteClick = (category) => {
    setDeleteError(null);
    setDeleteTarget(category);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await dispatch(deleteCategory(deleteTarget._id)).unwrap();
      toast("Xóa danh mục thành công");
      setDeleteTarget(null);
      setDeleteError(null);
      loadCategories({ search: debouncedSearch, page: pagination.page });
    } catch (err) {
      const message =
        err?.code === "CATEGORY_HAS_FOOD_ITEMS"
          ? CATEGORY_ERROR_MESSAGES.CATEGORY_HAS_FOOD_ITEMS
          : err?.message ?? "Không thể xóa danh mục";
      setDeleteError(message);
    }
  };

  return {
    categories: items,
    pagination,
    isLoading,
    isMutating,
    searchKeyword,
    modalMode,
    selectedCategory,
    deleteTarget,
    deleteError,
    showUnsavedDialog,
    serverFieldError,
    error,
    handleSearchChange,
    handlePageChange,
    openCreateModal,
    openEditModal,
    closeModal,
    confirmDiscardChanges,
    cancelDiscardChanges,
    submitForm,
    handleToggleStatus,
    handleDeleteClick,
    cancelDelete,
    confirmDelete,
  };
};

export default useCategory;
