import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import useAppToast from "../../../hooks/useAppToast";
import * as scheduledMenuApi from "../api/scheduledMenuApi";
import { DAY_LABEL } from "../constants/scheduledMenuConstants";
import {
  markDaysSaved,
  setError,
  setLoading,
  setSchedule,
  setSaving,
  updateDayItems,
} from "../redux/scheduledMenuSlice";
import { getDirtyDays } from "../utils/scheduleSnapshot";

const getApiErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const useScheduledMenu = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  const { schedule, savedSnapshot, isLoading, isSaving, error } = useSelector(
    (state) => state.scheduledMenu,
  );

  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDay, setPickerDay] = useState(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerCategory, setPickerCategory] = useState("");

  const dirtyDays = useMemo(
    () => getDirtyDays(schedule, savedSnapshot),
    [schedule, savedSnapshot],
  );

  const hasUnsavedChanges = dirtyDays.length > 0;

  const fetchSchedule = useCallback(
    async (silent = false) => {
      if (!silent) dispatch(setLoading(true));
      try {
        const data = await scheduledMenuApi.getWeeklySchedule();
        dispatch(setSchedule(data));
      } catch (err) {
        const message = getApiErrorMessage(err, "Không thể tải lịch thực đơn.");
        dispatch(setError(message));
        toast.error("Lỗi", message);
      }
    },
    [dispatch, toast],
  );

  const fetchPickerData = useCallback(async () => {
    try {
      const [items, categoriesData] = await Promise.all([
        scheduledMenuApi.fetchAllFoodItems(),
        scheduledMenuApi.getCategories(),
      ]);
      setFoodItems(items);
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
      const day = schedule.find((entry) => entry.dayOfWeek === dayOfWeek);
      if (!day) return;

      const alreadyAdded = day.menuItems.some(
        (item) => (item.foodItemId?._id || item.foodItemId) === foodItem._id,
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
      const day = schedule.find((entry) => entry.dayOfWeek === dayOfWeek);
      if (!day) return;

      dispatch(
        updateDayItems({
          dayOfWeek,
          menuItems: day.menuItems.filter(
            (item) => (item.foodItemId?._id || item.foodItemId) !== foodItemId,
          ),
        }),
      );
    },
    [dispatch, schedule],
  );

  const saveDaySchedule = useCallback(
    async (dayOfWeek) => {
      const day = schedule.find((entry) => entry.dayOfWeek === dayOfWeek);
      if (!day) return false;

      if (!dirtyDays.includes(dayOfWeek)) {
        return true;
      }

      dispatch(setSaving(true));

      try {
        const foodItemIds = day.menuItems.map(
          (item) => item.foodItemId?._id || item.foodItemId,
        );
        await scheduledMenuApi.updateDaySchedule(dayOfWeek, foodItemIds);
        dispatch(markDaysSaved([dayOfWeek]));
        toast.success(
          "Đã lưu",
          `Đã cập nhật lịch ${DAY_LABEL[dayOfWeek] || dayOfWeek}.`,
        );
        await fetchSchedule(true);
        return true;
      } catch (err) {
        const message = getApiErrorMessage(
          err,
          `Không thể lưu ${DAY_LABEL[dayOfWeek] || dayOfWeek}.`,
        );
        toast.error("Lưu thất bại", message);
        return false;
      } finally {
        dispatch(setSaving(false));
      }
    },
    [dirtyDays, dispatch, fetchSchedule, schedule, toast],
  );

  const saveAllSchedule = useCallback(async () => {
    if (dirtyDays.length === 0) {
      toast.info("Thông báo", "Không có thay đổi cần lưu.");
      return false;
    }

    dispatch(setSaving(true));
    const savedDays = [];
    let hasError = false;

    for (const dayOfWeek of dirtyDays) {
      const day = schedule.find((entry) => entry.dayOfWeek === dayOfWeek);
      if (!day) continue;

      const foodItemIds = day.menuItems.map(
        (item) => item.foodItemId?._id || item.foodItemId,
      );

      try {
        await scheduledMenuApi.updateDaySchedule(dayOfWeek, foodItemIds);
        savedDays.push(dayOfWeek);
      } catch (err) {
        hasError = true;
        const message = getApiErrorMessage(
          err,
          `Không thể lưu ${DAY_LABEL[dayOfWeek] || dayOfWeek}.`,
        );
        toast.error("Lưu thất bại", message);
        break;
      }
    }

    dispatch(setSaving(false));

    if (!hasError) {
      dispatch(markDaysSaved(savedDays));
      toast.success("Đã lưu", "Lịch thực đơn tuần đã được cập nhật.");
      await fetchSchedule(true);
      return true;
    }

    if (savedDays.length > 0) {
      dispatch(markDaysSaved(savedDays));
      await fetchSchedule(true);
    }

    return false;
  }, [dirtyDays, dispatch, fetchSchedule, schedule, toast]);

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
    dirtyDays,
    hasUnsavedChanges,
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
    saveDaySchedule,
    saveAllSchedule,
    setPickerSearch,
    setPickerCategory,
  };
};

export default useScheduledMenu;
