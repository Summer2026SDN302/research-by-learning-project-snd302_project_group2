import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";

import * as dailyMenuApi from "../../api/dailyMenuApi";
import {
  setMenu,
  clearMenu,
  setLoading,
  setError,
  setSelectedDate,
  setSearchTerm,
  setStatusFilter,
  setCurrentPage,
  resetFilters,
  selectDailyMenu,
  selectDailyMenuLoading,
  selectDailyMenuError,
  selectSelectedDate,
  selectSearchTerm,
  selectStatusFilter,
  selectCurrentPage,
} from "../../redux/dailyMenuSlice";
import {
  DAILY_MENU_PAGE_SIZE,
  DAILY_MENU_ERROR_MAP,
} from "../../constants/dailyMenuConstants";
import useAppToast from "../../../../hooks/useAppToast";
import { getApiErrorMsg } from "../../../../utils/errorUtils";

/**
 * useDailyMenu
 *
 * Main hook for fetching, filtering, paging, generating daily menu.
 */
const useDailyMenu = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  // ── Selectors ──────────────────────────────────────────────────────────────
  const menu = useSelector(selectDailyMenu);
  const isLoading = useSelector(selectDailyMenuLoading);
  const error = useSelector(selectDailyMenuError);
  const selectedDate = useSelector(selectSelectedDate);
  const searchTerm = useSelector(selectSearchTerm);
  const statusFilter = useSelector(selectStatusFilter);
  const currentPage = useSelector(selectCurrentPage);

  // ── Fetch by date ──────────────────────────────────────────────────────────
  const fetchMenu = useCallback(
    async (date) => {
      dispatch(setLoading(true));
      dispatch(clearMenu());
      try {
        const data = await dailyMenuApi.getMenuByDate(date);
        dispatch(setMenu(data));
      } catch (err) {
        const code = err?.response?.data?.errorCode;
        if (code === "DAILY_MENU_NOT_FOUND") {
          dispatch(setMenu(null));
        } else {
          dispatch(setError(getApiErrorMsg(DAILY_MENU_ERROR_MAP, err)));
        }
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch],
  );

  // Auto-fetch on date change
  useEffect(() => {
    if (selectedDate) fetchMenu(selectedDate);
  }, [selectedDate, fetchMenu]);

  // Reset selected date to today when unmounting the page
  useEffect(() => {
    return () => {
      dispatch(setSelectedDate(dayjs().format("YYYY-MM-DD")));
    };
  }, [dispatch]);

  // ── Client-side filter + paginate ──────────────────────────────────────────
  const allItems = useMemo(() => menu?.items ?? [], [menu]);

  const filteredItems = useMemo(() => {
    let items = allItems;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter((item) => {
        const name = item.foodItemId?.name ?? "";
        return name.toLowerCase().includes(q);
      });
    }

    if (statusFilter) {
      items = items.filter((item) => item.status === statusFilter);
    }

    return items;
  }, [allItems, searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / DAILY_MENU_PAGE_SIZE),
  );
  const safePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * DAILY_MENU_PAGE_SIZE;
    return filteredItems.slice(start, start + DAILY_MENU_PAGE_SIZE);
  }, [filteredItems, safePage]);

  // ── Statistics ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = allItems.length;
    const available = allItems.filter((i) => i.status === "Available").length;
    const unavailable = total - available;
    return { total, available, unavailable };
  }, [allItems]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDateChange = useCallback(
    (date) => dispatch(setSelectedDate(date)),
    [dispatch],
  );

  const handleSearch = useCallback(
    (term) => dispatch(setSearchTerm(term)),
    [dispatch],
  );

  const handleFilterChange = useCallback(
    (_key, value) => dispatch(setStatusFilter(value)),
    [dispatch],
  );

  const handleResetFilters = useCallback(
    () => dispatch(resetFilters()),
    [dispatch],
  );

  const handlePageChange = useCallback(
    (page) => dispatch(setCurrentPage(page)),
    [dispatch],
  );

  // ── Generate ───────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(
    async (date) => {
      dispatch(setLoading(true));
      try {
        const data = await dailyMenuApi.generateDailyMenu(date);
        dispatch(setMenu(data));
        dispatch(resetFilters());
        dispatch(setSelectedDate(date));
        toast.success(
          "Tạo thực đơn thành công",
          `Đã tạo thực đơn ngày ${date}.`,
        );
      } catch (err) {
        const msg = getApiErrorMsg(DAILY_MENU_ERROR_MAP, err);
        toast.error("Tạo thực đơn thất bại", msg);
        dispatch(setError(msg));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, toast],
  );

  const refetch = useCallback(() => {
    if (selectedDate) fetchMenu(selectedDate);
  }, [selectedDate, fetchMenu]);

  return {
    menu,
    isLoading,
    error,
    selectedDate,
    searchTerm,
    statusFilter,
    currentPage: safePage,
    totalPages,
    filteredItems,
    paginatedItems,
    stats,
    handleDateChange,
    handleSearch,
    handleFilterChange,
    handleResetFilters,
    handlePageChange,
    handleGenerate,
    refetch,
  };
};

export default useDailyMenu;
