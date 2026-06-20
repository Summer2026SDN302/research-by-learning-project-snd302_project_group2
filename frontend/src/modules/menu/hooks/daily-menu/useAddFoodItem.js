import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchFoodItems,
  clearFoodItems,
} from "../../redux/foodItemSlice";
import {
  fetchCategories,
  clearCategories,
} from "../../redux/categorySlice";
import useAppToast from "../../../../hooks/useAppToast";

/**
 * useAddFoodItem
 *
 * Hook to manage states and side-effects for fetching food items
 * to add to the daily menu. Uses the existing categories and foodItems submodules.
 *
 */
export const useAddFoodItem = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  const items = useSelector((state) => state.foodItem.items);
  const pagination = useSelector((state) => state.foodItem.pagination);
  const loading = useSelector((state) => state.foodItem.listStatus === "loading");
  const categories = useSelector((state) => state.category.items);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        await dispatch(fetchCategories({
          isActive: true,
          limit: 50,
        })).unwrap();
      } catch (err) {
        toast.error(
          "Lỗi",
          err?.message || "Không thể tải danh sách danh mục."
        );
      }
    };
    loadCategories();
  }, [dispatch, toast]);

  const fetchItems = useCallback(
    async (params = {}) => {
      try {
        await dispatch(
          fetchFoodItems({
            search: params.search ?? search,
            categoryId: (params.categoryId ?? categoryId) || undefined,
            isArchived: false,
            page: params.page ?? page,
            limit: 10,
          })
        ).unwrap();
      } catch (err) {
        toast.error(
          "Lỗi",
          err?.message || "Không thể tải danh sách món ăn."
        );
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
