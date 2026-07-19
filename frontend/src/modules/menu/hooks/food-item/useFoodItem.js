import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import useAppToast from '@/hooks/useAppToast';
import { getApiErrorMsg } from '@/utils/errorUtils';
import { FOOD_ITEM_ERROR_MESSAGES, DEFAULT_FOOD_ITEM_PAGE_SIZE } from '../../constants/foodItemConstants';
import { fetchCategories } from '../../redux/categorySlice';
import {
  clearListError,
  clearMutationError,
  clearSelectedItem,
  createFoodItem,
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
} from '../../redux/foodItemSlice';
import { mapApiValidationErrors, normalizeFoodItemPayload } from '../../utils/foodItemUtils';

const useFoodItem = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

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

  const {
    items: categoryItems,
    listStatus: categoryListStatus,
    error: categoryError,
  } = useSelector((state) => state.category);

  const [searchKeyword, setSearchKeyword] = useState(filters.search ?? '');
  const [modalMode, setModalMode] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState({});
  const [archiveConfirmTarget, setArchiveConfirmTarget] = useState(null);

  const pendingCloseRef = useRef(false);
  const debouncedSearch = useDebouncedValue(searchKeyword);

  const isLoading = listStatus === 'loading';
  const isSubmitting = mutationStatus === 'loading';

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
    dispatch(
      fetchFoodItems({
        search: debouncedSearch,
        categoryId: filters.categoryId || undefined,
        isArchived: filters.isArchived !== "" ? filters.isArchived : undefined,
        page: 1,
        limit: pagination.limit ?? DEFAULT_FOOD_ITEM_PAGE_SIZE,
      })
    );
  }, [debouncedSearch, dispatch, filters.categoryId, filters.isArchived, pagination.limit]);

  useEffect(() => {
  dispatch(fetchCategories({ limit: 50, page: 1, isActive: true }));
}, [dispatch]);

  const categoryOptions = useMemo(
    () =>
      categoryItems.map((category) => ({
        value: category._id,
        label: category.name,
      })),
    [categoryItems],
  );

  const categoryOptionsLoading = categoryListStatus === 'loading';
  const categoryOptionsError =
    categoryListStatus === 'failed'
      ? categoryError?.message ?? 'Không thể tải danh mục'
      : null;

  const handleSearchChange = (value) => {
    setSearchKeyword(value);
  };

  const handleCategoryChange = useCallback((value) => {
    dispatch(setCategoryFilter(value));
    dispatch(setPage(1));
    loadFoodItems({
      categoryId: value,
      page: 1,
      search: debouncedSearch,
      isArchived: filters.isArchived,
    });
  }, [dispatch, loadFoodItems, debouncedSearch, filters.isArchived]);

  const handleArchivedFilterChange = useCallback((value) => {
    dispatch(setArchivedFilter(value));
    dispatch(setPage(1));
    loadFoodItems({
      isArchived: value,
      page: 1,
      search: debouncedSearch,
      categoryId: filters.categoryId,
    });
  }, [dispatch, loadFoodItems, debouncedSearch, filters.categoryId]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    dispatch(setPage(newPage));
    loadFoodItems({ page: newPage });
  };

  const openCreateModal = () => {
    dispatch(clearSelectedItem());
    dispatch(resetMutationState());
    dispatch(clearListError());
    dispatch(clearMutationError());
    setServerFieldErrors({});
    setModalMode('create');
  };

  const openDetailDialog = (foodItem) => {
    setDetailTarget(foodItem);
  };

  const closeDetailDialog = () => {
    setDetailTarget(null);
  };

  const openEditModal = async (foodItem) => {
    dispatch(clearListError());
    dispatch(clearMutationError());
    dispatch(resetMutationState());
    setServerFieldErrors({});
    setModalMode('edit');
    dispatch(setSelectedItem(foodItem));

    if (foodItem?._id) {
      try {
        await dispatch(fetchFoodItemById(foodItem._id)).unwrap();
      } catch (error) {
        toast.error('Lỗi', getApiErrorMsg(FOOD_ITEM_ERROR_MESSAGES, { response: { data: { error: { code: error?.code }, message: error?.message } } }, 'Không thể tải chi tiết món ăn'));
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
    dispatch(clearListError());
    dispatch(clearMutationError());
    setServerFieldErrors({});
  };

  const confirmDiscardChanges = () => {
    setShowUnsavedDialog(false);
    pendingCloseRef.current = false;
    setModalMode(null);
    dispatch(clearSelectedItem());
    dispatch(resetMutationState());
    dispatch(clearListError());
    dispatch(clearMutationError());
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
        toast.success('Thành công', 'Tạo món ăn thành công');
      } else if (modalMode === 'edit' && selectedItem?._id) {
        await dispatch(updateFoodItem({ id: selectedItem._id, body: payload })).unwrap();
        toast.success('Thành công', 'Cập nhật món ăn thành công');
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

      toast.error('Lỗi', getApiErrorMsg(FOOD_ITEM_ERROR_MESSAGES, { response: { data: { error: { code: error?.code }, message: error?.message } } }, 'Đã xảy ra lỗi'));
    }
  };

  const handleToggleArchive = (foodItem) => {
    setArchiveConfirmTarget(foodItem);
  };

  const handleConfirmToggleArchive = async () => {
    if (!archiveConfirmTarget) return;
    const foodItem = archiveConfirmTarget;
    setArchiveConfirmTarget(null);
    dispatch(clearListError());
    dispatch(clearMutationError());
    try {
      await dispatch(
        toggleFoodItemArchive({
          id: foodItem._id,
          isArchived: !foodItem.isArchived,
        }),
      ).unwrap();
      toast.success('Thành công', foodItem.isArchived ? 'Đã bật bán lại món ăn' : 'Đã ngừng bán món ăn');
      refreshList();
    } catch (error) {
      toast.error('Lỗi', getApiErrorMsg(FOOD_ITEM_ERROR_MESSAGES, { response: { data: { error: { code: error?.code }, message: error?.message } } }, 'Không thể cập nhật trạng thái'));
    }
  };

  const handleCancelToggleArchive = () => {
    setArchiveConfirmTarget(null);
  };

  const emptyTitle = useMemo(() => {
    if (searchKeyword.trim() || filters.categoryId || filters.isArchived !== '') {
      return 'Không tìm thấy món ăn';
    }
    return 'Chưa có món ăn nào';
  }, [filters.categoryId, filters.isArchived, searchKeyword]);

  const emptyMessage = useMemo(() => {
    if (searchKeyword.trim() || filters.categoryId || filters.isArchived !== '') {
      return 'Không tìm thấy món ăn phù hợp.';
    }
    return 'Chưa có món ăn nào.';
  }, [filters.categoryId, filters.isArchived, searchKeyword]);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(searchKeyword.trim()) ||
      Boolean(filters.categoryId) ||
      filters.isArchived !== '',
      [filters.categoryId, filters.isArchived, searchKeyword],
  );

  const isEmptyState = useMemo(
    () => !isLoading && !listError && pagination.total === 0 && !hasActiveFilters,
    [hasActiveFilters, isLoading, listError, pagination.total],
  );

  const filterBarConfig = useMemo(
    () => [
      {
        key: 'categoryId',
        label: 'Danh mục',
        options: [
          { value: '', label: 'Tất cả danh mục' },
          ...categoryOptions,
        ],
      },
      {
        key: 'isArchived',
        label: 'Trạng thái',
        options: [
          { value: '', label: 'Tất cả' },
          { value: 'false', label: 'Đang bán' },
          { value: 'true', label: 'Ngừng bán' },
        ],
      },
    ],
    [categoryOptions],
  );

  const filterValues = useMemo(
    () => ({
      categoryId: filters.categoryId ?? '',
      isArchived: filters.isArchived ?? '',
    }),
    [filters.categoryId, filters.isArchived],
  );

  const handleFilterChange = useCallback(
    (key, value) => {
      if (key === 'categoryId') handleCategoryChange(value);
      else if (key === 'isArchived') handleArchivedFilterChange(value);
    },
    [handleCategoryChange, handleArchivedFilterChange],
  );

  const handleFilterReset = useCallback(() => {
    handleCategoryChange('');
    handleArchivedFilterChange('');
  }, [handleCategoryChange, handleArchivedFilterChange]);

  const handleExport = useCallback(() => {
    toast.info('Thông tin', 'Tính năng xuất file đang phát triển');
  }, [toast]);

  const errorMsg = useMemo(() => {
    const err = listError || mutationError;
    if (!err) return null;
    return getApiErrorMsg(
      FOOD_ITEM_ERROR_MESSAGES,
      { response: { data: { error: { code: err?.code }, message: err?.message } } },
      "Đã xảy ra lỗi"
    );
  }, [listError, mutationError]);

  const errorTitle = useMemo(() => {
    if (listError) {
      return "Không tải được danh sách món ăn";
    }
    if (mutationError) {
      return "Lỗi thực hiện thao tác";
    }
    return null;
  }, [listError, mutationError]);

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
    errorMsg,
    errorTitle,
    modalMode,
    detailTarget,
    showUnsavedDialog,
    serverFieldErrors,
    categoryOptions,
    categoryOptionsLoading,
    categoryOptionsError,
    emptyTitle,
    emptyMessage,
    hasActiveFilters,
    isEmptyState,
    filterBarConfig,
    filterValues,
    handleSearchChange,
    handleFilterChange,
    handleFilterReset,
    handlePageChange,
    openCreateModal,
    openDetailDialog,
    closeDetailDialog,
    openEditModal,
    closeModal,
    confirmDiscardChanges,
    cancelDiscardChanges,
    submitForm,
    handleToggleArchive,
    archiveConfirmTarget,
    handleConfirmToggleArchive,
    handleCancelToggleArchive,
    handleExport,
  };
};

export default useFoodItem;