import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as foodItemApi from '../../api/foodItemApi';
import * as categoryApi from '../../api/categoryApi';
import {
  setFoodItems,
  setFoodItemsLoading,
  clearFoodItems,
  selectFoodItems,
  selectFoodItemsPagination,
  selectFoodItemsLoading,
} from '../../redux/foodItemSlice';
import useAppToast from '../../../../hooks/useAppToast';

/**
 * useAddFoodItem
 *
 * Hook to manage states and side-effects for fetching food items
 * to add to the daily menu.
 *
 * @param {boolean} open - Whether the food item modal is currently open.
 */
export const useAddFoodItem = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  const items      = useSelector(selectFoodItems);
  const pagination = useSelector(selectFoodItemsPagination);
  const loading    = useSelector(selectFoodItemsLoading);

  const [categories, setCategories] = useState([]);
  const [search, setSearch]       = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage]           = useState(1);

  // Fetch categories on mount
  useEffect(() => {
    let active = true;
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getCategories({ isActive: true, limit: 100 });
        if (active) {
          setCategories(data?.items || []);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
    return () => {
      active = false;
    };
  }, []);

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
      } catch {
        toast.error('Lỗi', 'Không thể tải danh sách món ăn.');
      } finally {
        dispatch(setFoodItemsLoading(false));
      }
    },
    [dispatch, search, categoryId, page, toast],
  );

  // Fetch on mount or search / category / page change
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Clear food items from Redux on unmount
  useEffect(() => {
    return () => {
      dispatch(clearFoodItems());
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

