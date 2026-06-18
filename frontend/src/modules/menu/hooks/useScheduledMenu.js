import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import useAppToast from "../../../hooks/useAppToast";
import * as scheduledMenuApi from "../api/scheduledMenuApi";
import {
  setError,
  setLoading,
  setSchedule,
  setSaving,
  updateDayItems,
} from "../redux/scheduledMenuSlice";

const getApiErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const useScheduledMenu = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  const { schedule, isLoading, isSaving, error } = useSelector(
    (state) => state.scheduledMenu,
  );

  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDay, setPickerDay] = useState(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerCategory, setPickerCategory] = useState("");

  const fetchSchedule = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const data = await scheduledMenuApi.getWeeklySchedule();
      dispatch(setSchedule(data));
    } catch (err) {
      const message = getApiErrorMessage(err, "Không thể tải lịch thực đơn.");
      dispatch(setError(message));
      toast.error("Lỗi", message);
    }
  }, [dispatch, toast]);

  const fetchPickerData = useCallback(async () => {
    try {
      const [itemsData, categoriesData] = await Promise.all([
        scheduledMenuApi.getFoodItems({ isArchived: false, limit: 100 }),
        scheduledMenuApi.getCategories(),
      ]);
      setFoodItems(itemsData?.items || []);
      setCategories(categoriesData?.items || categoriesData || []);
    } catch {
      // picker data is non-critical; fail silently
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
    fetchPickerData();
  }, [fetchSchedule, fetchPickerData]);

  const openPicker = useCallback((day) => {
    setPickerDay(day);
    setPickerSearch("");
    setPickerCategory("");
    setPickerOpen(true);
  }, []);

  const closePicker = useCallback(() => {
    setPickerOpen(false);
    setPickerDay(null);
  }, []);

  const addItemToDay = useCallback(
    (dayOfWeek, foodItem) => {
      const day = schedule.find((d) => d.dayOfWeek === dayOfWeek);
      if (!day) return;

      const alreadyAdded = day.menuItems.some(
        (m) => (m.foodItemId?._id || m.foodItemId) === foodItem._id,
      );
      if (alreadyAdded) return;

      dispatch(
        updateDayItems({
          dayOfWeek,
          menuItems: [...day.menuItems, { foodItemId: foodItem }],
        }),
      );
    },
    [dispatch, schedule],
  );

  const removeItemFromDay = useCallback(
    (dayOfWeek, foodItemId) => {
      const day = schedule.find((d) => d.dayOfWeek === dayOfWeek);
      if (!day) return;

      dispatch(
        updateDayItems({
          dayOfWeek,
          menuItems: day.menuItems.filter(
            (m) => (m.foodItemId?._id || m.foodItemId) !== foodItemId,
          ),
        }),
      );
    },
    [dispatch, schedule],
  );

  const saveAllSchedule = useCallback(async () => {
    dispatch(setSaving(true));
    let hasError = false;

    for (const day of schedule) {
      const foodItemIds = day.menuItems.map(
        (m) => m.foodItemId?._id || m.foodItemId,
      );
      try {
        await scheduledMenuApi.updateDaySchedule(day.dayOfWeek, foodItemIds);
      } catch (err) {
        hasError = true;
        const message = getApiErrorMessage(
          err,
          `Không thể lưu ${day.dayOfWeek}.`,
        );
        toast.error("Lưu thất bại", message);
        break;
      }
    }

    dispatch(setSaving(false));

    if (!hasError) {
      toast.success("Đã lưu", "Lịch thực đơn tuần đã được cập nhật.");
    }
  }, [dispatch, schedule, toast]);

  const filteredPickerItems = foodItems.filter((item) => {
    const matchSearch = pickerSearch
      ? item.name.toLowerCase().includes(pickerSearch.toLowerCase())
      : true;
    const matchCategory = pickerCategory
      ? (item.categoryId?._id || item.categoryId) === pickerCategory
      : true;
    return matchSearch && matchCategory;
  });

  return {
    schedule,
    isLoading,
    isSaving,
    error,
    pickerOpen,
    pickerDay,
    pickerSearch,
    pickerCategory,
    filteredPickerItems,
    categories,
    openPicker,
    closePicker,
    addItemToDay,
    removeItemFromDay,
    saveAllSchedule,
    setPickerSearch,
    setPickerCategory,
  };
};

export default useScheduledMenu;
