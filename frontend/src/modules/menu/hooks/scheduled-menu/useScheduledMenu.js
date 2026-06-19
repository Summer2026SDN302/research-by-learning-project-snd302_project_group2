import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import useAppToast from "../../../../hooks/useAppToast";
import * as scheduledMenuApi from "../../api/scheduledMenuApi";
import { fetchAllFoodItems } from "../../api/foodItemApi";
import { getCategories } from "../../api/categoryApi";
import { DAY_LABEL, SCHEDULED_MENU_ERROR_MAP } from "../../constants/scheduledMenuConstants";
import {
  markDaysSaved,
  revertDayItems,
  setError,
  setLoading,
  setSchedule,
  setSaving,
  updateDayItems,
} from "../../redux/scheduledMenuSlice";
import { getDirtyDays } from "../../utils/scheduleSnapshot";
import { getApiErrorMsg } from "../../../../utils/errorUtils";

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
        const message = getApiErrorMsg(SCHEDULED_MENU_ERROR_MAP, err, "Không thể tải lịch thực đơn.");
        dispatch(setError(message));
        toast.error("Lỗi", message);
      }
    },
    [dispatch, toast],
  );

  const fetchPickerData = useCallback(async () => {
    try {
      const [items, categoriesData] = await Promise.all([
        fetchAllFoodItems(),
        getCategories({ limit: 50 }),
      ]);
      setFoodItems(items);
      setCategories(categoriesData?.items || categoriesData || []);
    } catch {
      // picker data is non-critical; fail silently
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      // Defer execution to avoid calling setState synchronously within the effect body
      await Promise.resolve();
      if (!active) return;
      fetchSchedule();
      fetchPickerData();
    };

    loadData();

    return () => {
      active = false;
    };
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

  const addItemsToDay = useCallback(
    (dayOfWeek, foodItemsList) => {
      const day = schedule.find((entry) => entry.dayOfWeek === dayOfWeek);
      if (!day) return;

      const newMenuItems = [...day.menuItems];
      let added = false;
      for (const foodItem of foodItemsList) {
        const alreadyAdded = day.menuItems.some(
          (item) => (item.foodItemId?._id || item.foodItemId) === foodItem._id,
        );
        if (!alreadyAdded) {
          newMenuItems.push({ foodItemId: foodItem });
          added = true;
        }
      }

      if (added) {
        dispatch(
          updateDayItems({
            dayOfWeek,
            menuItems: newMenuItems,
          }),
        );
      }
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
        const message = getApiErrorMsg(
          SCHEDULED_MENU_ERROR_MAP,
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

    try {
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
          const message = getApiErrorMsg(
            SCHEDULED_MENU_ERROR_MAP,
            err,
            `Không thể lưu ${DAY_LABEL[dayOfWeek] || dayOfWeek}.`,
          );
          toast.error("Lưu thất bại", message);
          break;
        }
      }

      if (savedDays.length > 0) {
        dispatch(markDaysSaved(savedDays));
        if (!hasError) {
          toast.success("Đã lưu", "Lịch thực đơn tuần đã được cập nhật.");
        }
        await fetchSchedule(true);
      }

      return !hasError;
    } finally {
      dispatch(setSaving(false));
    }
  }, [dirtyDays, dispatch, fetchSchedule, schedule, toast]);

  const cancelDayEdits = useCallback(
    (dayOfWeek) => {
      dispatch(revertDayItems(dayOfWeek));
    },
    [dispatch],
  );

  const cancelAllEdits = useCallback(() => {
    for (const dayOfWeek of dirtyDays) {
      dispatch(revertDayItems(dayOfWeek));
    }
  }, [dispatch, dirtyDays]);

  const updatePickerFilters = useCallback((filters = {}) => {
    if (filters.search !== undefined) setPickerSearch(filters.search);
    if (filters.category !== undefined) setPickerCategory(filters.category);
  }, []);

  const filteredPickerItems = useMemo(() => {
    return foodItems.filter((item) => {
      const matchSearch = pickerSearch
        ? item.name.toLowerCase().includes(pickerSearch.toLowerCase())
        : true;
      const matchCategory = pickerCategory
        ? (item.categoryId?._id || item.categoryId) === pickerCategory
        : true;
      return matchSearch && matchCategory;
    });
  }, [foodItems, pickerSearch, pickerCategory]);

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
    addItemsToDay,
    removeItemFromDay,
    saveDaySchedule,
    saveAllSchedule,
    cancelDayEdits,
    cancelAllEdits,
    updatePickerFilters,
  };
};

export default useScheduledMenu;
