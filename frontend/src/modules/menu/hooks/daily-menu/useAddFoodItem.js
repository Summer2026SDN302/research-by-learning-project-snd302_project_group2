import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as foodItemApi from "../../api/foodItemApi";
import * as categoryApi from "../../api/categoryApi";
import {
  setFoodItems,
  setFoodItemsLoading,
  setFoodItemsError,
  clearFoodItems,
  selectFoodItems,
  selectFoodItemsPagination,
  selectFoodItemsLoading,
} from "../../redux/foodItemSlice";
import {
  setCategories,
  setCategoriesLoading,
  setCategoriesError,
  clearCategories,
  selectCategories,
} from "../../redux/categorySlice";
import useAppToast from "../../../../hooks/useAppToast";

/**
 * useAddFoodItem
 *
 * Hook to manage states and side-effects for fetching food items
 * to add to the daily menu.
 *
 */
export const useAddFoodItem = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  const items = useSelector(selectFoodItems);
  const pagination = useSelector(selectFoodItemsPagination);
  const loading = useSelector(selectFoodItemsLoading);
  const categories = useSelector(selectCategories);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);

  // Fetch categories on mount
  useEffect(() => {
    let active = true;
    const fetchCategories = async () => {
      dispatch(setCategoriesLoading(true));
      try {
        const data = await categoryApi.getCategories({
          isActive: true,
          limit: 50,
        });
        if (active) {
          dispatch(setCategories(data?.items || []));
        }
      } catch (err) {
        const errMsg =
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách danh mục.";
        dispatch(setCategoriesError(errMsg));
        toast.error("Lỗi", errMsg);
      } finally {
        if (active) {
          dispatch(setCategoriesLoading(false));
        }
      }
    };
    fetchCategories();
    return () => {
      active = false;
    };
  }, [dispatch, toast]);

  const fetchItems = useCallback(
    async (params = {}) => {
      dispatch(setFoodItemsLoading(true));
      try {
        const data = await foodItemApi.getFoodItems({
          search: params.search ?? search,
          categoryId: (params.categoryId ?? categoryId) || undefined,
          isArchived: false,
          page: params.page ?? page,
          limit: 10,
        });
        dispatch(setFoodItems(data));
      } catch (err) {
        const errMsg =
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách món ăn.";
        dispatch(setFoodItemsError(errMsg));
        toast.error("Lỗi", errMsg);
      } finally {
        dispatch(setFoodItemsLoading(false));
      }
    },
    [dispatch, search, categoryId, page, toast],
  );

  // Fetch on mount or search / category / page change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchItems]);

  // Clear food items and categories from Redux on unmount
  useEffect(() => {
    return () => {
      dispatch(clearFoodItems());
      dispatch(clearCategories());
    };
  }, [dispatch]);

  return {
    categories,
    items,
    loading,
    pagination,
    search,
    setSearch,
    page,
    setPage,
    categoryId,
    setCategoryId,
  };
};

export default useAddFoodItem;
