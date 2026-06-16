import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as dailyMenuApi from "../../api/dailyMenuApi";
import {
  setMenu,
  setMutating,
  selectDailyMenuMutating,
} from "../../redux/dailyMenuSlice";
import useAppToast from "../../../../hooks/useAppToast";
import { getApiErrorMsg } from "../../../../utils/errorUtils";
import { DAILY_MENU_ERROR_MAP } from "../../constants/daily-menu/dailyMenuConstants";

/**
 * useDailyMenuItem
 *
 * Hook for item-level actions: update, add, remove + modal state management.
 */
const useDailyMenuItem = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();
  const isMutating = useSelector(selectDailyMenuMutating);

  // ── Modal states ───────────────────────────────────────────────────────────
  const [updateModal, setUpdateModal] = useState({ open: false, item: null });
  const [priceHistoryModal, setPriceHistoryModal] = useState({
    open: false,
    item: null,
  });
  const [addItemModal, setAddItemModal] = useState(false);
  const [generateModal, setGenerateModal] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState({
    open: false,
    item: null,
  });

  // ── Update item ────────────────────────────────────────────────────────────
  const handleUpdateItem = useCallback(
    async (menuId, itemId, payload) => {
      dispatch(setMutating(true));
      try {
        const data = await dailyMenuApi.updateDailyMenuItem(
          menuId,
          itemId,
          payload,
        );
        dispatch(setMenu(data));
        toast.success("Cập nhật thành công", "Đã cập nhật món ăn.");
        setUpdateModal({ open: false, item: null });
      } catch (err) {
        toast.error("Cập nhật thất bại", getApiErrorMsg(DAILY_MENU_ERROR_MAP, err));
      } finally {
        dispatch(setMutating(false));
      }
    },
    [dispatch, toast],
  );

  // ── Add food item ──────────────────────────────────────────────────────────
  const handleAddFoodItem = useCallback(
    async (menuId, foodItemId) => {
      dispatch(setMutating(true));
      try {
        const data = await dailyMenuApi.addFoodItemToDailyMenu(
          menuId,
          foodItemId,
        );
        dispatch(setMenu(data));
        toast.success("Thêm món thành công", "Đã thêm món ăn vào thực đơn.");
        setAddItemModal(false);
      } catch (err) {
        toast.error("Thêm món thất bại", getApiErrorMsg(DAILY_MENU_ERROR_MAP, err));
      } finally {
        dispatch(setMutating(false));
      }
    },
    [dispatch, toast],
  );

  // ── Remove food item ──────────────────────────────────────────────────────
  const handleRemoveItem = useCallback(
    async (menuId, itemId) => {
      dispatch(setMutating(true));
      try {
        const data = await dailyMenuApi.removeFoodItemFromDailyMenu(
          menuId,
          itemId,
        );
        dispatch(setMenu(data));
        toast.success("Xóa thành công", "Đã xóa món ăn khỏi thực đơn.");
        setConfirmRemove({ open: false, item: null });
      } catch (err) {
        toast.error("Xóa thất bại", getApiErrorMsg(DAILY_MENU_ERROR_MAP, err));
      } finally {
        dispatch(setMutating(false));
      }
    },
    [dispatch, toast],
  );

  // ── Open / Close helpers ──────────────────────────────────────────────────
  const openUpdate = useCallback(
    (item) => setUpdateModal({ open: true, item }),
    [],
  );
  const closeUpdate = useCallback(
    () => setUpdateModal({ open: false, item: null }),
    [],
  );

  const openPriceHistory = useCallback(
    (item) => setPriceHistoryModal({ open: true, item }),
    [],
  );
  const closePriceHistory = useCallback(
    () => setPriceHistoryModal({ open: false, item: null }),
    [],
  );

  const openAddItem = useCallback(() => setAddItemModal(true), []);
  const closeAddItem = useCallback(() => setAddItemModal(false), []);

  const openGenerate = useCallback(() => setGenerateModal(true), []);
  const closeGenerate = useCallback(() => setGenerateModal(false), []);

  const openConfirmRemove = useCallback(
    (item) => setConfirmRemove({ open: true, item }),
    [],
  );
  const closeConfirmRemove = useCallback(
    () => setConfirmRemove({ open: false, item: null }),
    [],
  );

  return {
    isMutating,
    // modal states
    updateModal,
    priceHistoryModal,
    addItemModal,
    generateModal,
    confirmRemove,
    // handlers
    handleUpdateItem,
    handleAddFoodItem,
    handleRemoveItem,
    // modal open/close
    openUpdate,
    closeUpdate,
    openPriceHistory,
    closePriceHistory,
    openAddItem,
    closeAddItem,
    openGenerate,
    closeGenerate,
    openConfirmRemove,
    closeConfirmRemove,
  };
};

export default useDailyMenuItem;
