import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import { getCategories } from '../api/categoryApi';
import { FOOD_ITEM_ERROR_MESSAGES, DEFAULT_FOOD_ITEM_PAGE_SIZE } from '../constants/foodItemConstants';
import {
  clearListError,
  clearMutationError,
  clearSelectedItem,
  createFoodItem,
  deleteFoodItem,
  fetchFoodItemById,
  fetchFoodItems,
  resetMutationState,
  setCategoryFilter,
  setArchivedFilter,
  setPage,
  setSearch,
  setSelectedItem,
  toggleFoodItemArchive,
  updateFoodItem,
} from '../redux/foodItemSlice';
import { mapApiValidationErrors, normalizeFoodItemPayload } from '../utils/foodItemUtils';

const useDebouncedValue = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

const useFoodItem = () => {
  const dispatch = useDispatch();
  const { showToast } = useOutletContext() ?? {};

  const {
    items,
    pagination,
    filters,
    selectedItem,
    listStatus,
    listError,
    mutationStatus,
    mutationError,
  } = useSelector((state) => state.foodItem);

  const [searchKeyword, setSearchKeyword] = useState(filters.search ?? '');
  const [modalMode, setModalMode] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState({});
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoryOptionsLoading, setCategoryOptionsLoading] = useState(false);
  const [categoryOptionsError, setCategoryOptionsError] = useState(null);

  const pendingCloseRef = useRef(false);
  const debouncedSearch = useDebouncedValue(searchKeyword);

  const isLoading = listStatus === 'loading';
  const isSubmitting = mutationStatus === 'loading';

  const toast = useCallback(
    (message, type = 'success') => {
      showToast?.({ message, type });
    },
    [showToast],
  );

  const loadFoodItems = useCallback(
    (overrides = {}) => {
      dispatch(
        fetchFoodItems({
          search: overrides.search ?? filters.search,
          categoryId: overrides.categoryId ?? filters.categoryId,
          isArchived: overrides.isArchived ?? filters.isArchived,
          page: overrides.page ?? pagination.page,
          limit: overrides.limit ?? pagination.limit ?? DEFAULT_FOOD_ITEM_PAGE_SIZE,
        }),
      );
    },
    [dispatch, filters.categoryId, filters.isArchived, filters.search, pagination.limit, pagination.page],
  );

  useEffect(() => {
    dispatch(setSearch(debouncedSearch));
    dispatch(setPage(1));
    loadFoodItems({ search: debouncedSearch, page: 1 });
  }, [debouncedSearch, dispatch, loadFoodItems]);

  useEffect(() => {
    const loadCategoryOptions = async () => {
      setCategoryOptionsLoading(true);
      setCategoryOptionsError(null);

      try {
        const response = await getCategories({ limit: 50 });
        setCategoryOptions((response.items ?? []).map((category) => ({
          value: category._id,
          label: category.name,
        })));
      } catch (error) {
        setCategoryOptionsError(error?.message ?? 'Không thể tải danh mục');
      } finally {
        setCategoryOptionsLoading(false);
      }
    };

    loadCategoryOptions();
  }, []);

  const handleSearchChange = (value) => {
    setSearchKeyword(value);
  };

  const handleCategoryChange = (value) => {
    dispatch(setCategoryFilter(value));
    dispatch(setPage(1));
    loadFoodItems({
      categoryId: value,
      page: 1,
      search: debouncedSearch,
      isArchived: filters.isArchived,
    });
  };

  const handleArchivedFilterChange = (value) => {
    dispatch(setArchivedFilter(value));
    dispatch(setPage(1));
    loadFoodItems({
      isArchived: value,
      page: 1,
      search: debouncedSearch,
      categoryId: filters.categoryId,
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    dispatch(setPage(newPage));
    loadFoodItems({ page: newPage });
  };

  const openCreateModal = () => {
    dispatch(clearSelectedItem());
    dispatch(resetMutationState());
    dispatch(clearListError());
    setServerFieldErrors({});
    setModalMode('create');
  };

  const openEditModal = async (foodItem) => {
    dispatch(clearListError());
    dispatch(resetMutationState());
    setServerFieldErrors({});
    setModalMode('edit');
    dispatch(setSelectedItem(foodItem));

    if (foodItem?._id) {
      try {
        await dispatch(fetchFoodItemById(foodItem._id)).unwrap();
      } catch (error) {
        toast(error?.message ?? 'Không thể tải chi tiết món ăn', 'error');
      }
    }
  };

  const closeModal = (isDirty = false) => {
    if (isDirty) {
      pendingCloseRef.current = true;
      setShowUnsavedDialog(true);
      return;
    }

    setModalMode(null);
    dispatch(clearSelectedItem());
    dispatch(resetMutationState());
    setServerFieldErrors({});
  };

  const confirmDiscardChanges = () => {
    setShowUnsavedDialog(false);
    pendingCloseRef.current = false;
    setModalMode(null);
    dispatch(clearSelectedItem());
    dispatch(resetMutationState());
    setServerFieldErrors({});
  };

  const cancelDiscardChanges = () => {
    setShowUnsavedDialog(false);
    pendingCloseRef.current = false;
  };

  const refreshList = useCallback(
    (overrides = {}) => {
      loadFoodItems({
        search: overrides.search ?? debouncedSearch,
        categoryId: overrides.categoryId ?? filters.categoryId,
        isArchived: overrides.isArchived ?? filters.isArchived,
        page: overrides.page ?? pagination.page,
        limit: overrides.limit ?? pagination.limit,
      });
    },
    [debouncedSearch, filters.categoryId, filters.isArchived, loadFoodItems, pagination.limit, pagination.page],
  );

  const submitForm = async (data) => {
    dispatch(clearListError());
    dispatch(clearMutationError());
    setServerFieldErrors({});

    const payload = normalizeFoodItemPayload(data);

    try {
      if (modalMode === 'create') {
        await dispatch(createFoodItem(payload)).unwrap();
        toast('Tạo món ăn thành công');
      } else if (modalMode === 'edit' && selectedItem?._id) {
        await dispatch(updateFoodItem({ id: selectedItem._id, body: payload })).unwrap();
        toast('Cập nhật món ăn thành công');
      }

      setModalMode(null);
      dispatch(clearSelectedItem());
      refreshList({ page: pagination.page });
    } catch (error) {
      if (error?.code === 'VALIDATION_ERROR') {
        setServerFieldErrors(mapApiValidationErrors(error.details));
      } else if (error?.code === 'FOODITEM_NAME_EXISTS') {
        setServerFieldErrors({ name: FOOD_ITEM_ERROR_MESSAGES.FOODITEM_NAME_EXISTS });
      } else if (error?.code === 'CATEGORY_NOT_FOUND') {
        setServerFieldErrors({ categoryId: FOOD_ITEM_ERROR_MESSAGES.CATEGORY_NOT_FOUND });
      }

      toast(error?.message ?? 'Đã xảy ra lỗi', 'error');
    }
  };

  const handleToggleArchive = async (foodItem) => {
    try {
      await dispatch(
        toggleFoodItemArchive({
          id: foodItem._id,
          isArchived: !foodItem.isArchived,
        }),
      ).unwrap();
      toast(foodItem.isArchived ? 'Đã huỷ lưu trữ món ăn' : 'Đã lưu trữ món ăn');
      refreshList();
    } catch (error) {
      toast(error?.message ?? 'Không thể cập nhật trạng thái', 'error');
    }
  };

  const handleDeleteClick = (foodItem) => {
    setDeleteTarget(foodItem);
    setDeleteError(null);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await dispatch(deleteFoodItem(deleteTarget._id)).unwrap();
      toast('Xóa món ăn thành công');
      setDeleteTarget(null);
      setDeleteError(null);
      refreshList();
    } catch (error) {
      const message =
        error?.code === 'FOODITEM_IN_USE'
          ? FOOD_ITEM_ERROR_MESSAGES.FOODITEM_IN_USE
          : error?.message ?? 'Không thể xóa món ăn';
      setDeleteError(message);
      toast(message, 'error');
    }
  };

  const emptyMessage = useMemo(() => {
    if (searchKeyword.trim() || filters.categoryId || filters.isArchived !== '') {
      return 'Không tìm thấy món ăn phù hợp.';
    }
    return 'Chưa có món ăn nào.';
  }, [filters.categoryId, filters.isArchived, searchKeyword]);

  return {
    items,
    pagination,
    filters,
    selectedItem,
    searchKeyword,
    isLoading,
    isSubmitting,
    listError,
    mutationError,
    modalMode,
    deleteTarget,
    deleteError,
    showUnsavedDialog,
    serverFieldErrors,
    categoryOptions,
    categoryOptionsLoading,
    categoryOptionsError,
    emptyMessage,
    handleSearchChange,
    handleCategoryChange,
    handleArchivedFilterChange,
    handlePageChange,
    openCreateModal,
    openEditModal,
    closeModal,
    confirmDiscardChanges,
    cancelDiscardChanges,
    submitForm,
    handleToggleArchive,
    handleDeleteClick,
    cancelDelete,
    confirmDelete,
  };
};

export default useFoodItem;