import dayjs from "dayjs";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyOrdersThunk,
  fetchOwnOrderKpisThunk,
} from "../redux/orderSlice";
import useAppToast from "@/hooks/useAppToast";

const getTodayDateString = () => dayjs().format("YYYY-MM-DD");

const INITIAL_FILTERS = {
  orderStatus: "",
  fromDate: "",
  toDate: "",
  page: 1,
  limit: 10,
};

export const useOwnOrderHistory = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  const orders = useSelector((state) => state.order.orderList);
  const pagination = useSelector((state) => state.order.orderPagination);
  const listStatus = useSelector((state) => state.order.listStatus);
  const error = useSelector((state) => state.order.listError);
  const kpis = useSelector((state) => state.order.ownHistoryKpis);

  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const fetchOrdersData = useCallback(async () => {
    const queryParams = {
      page: filters.page,
      limit: filters.limit,
    };

    if (filters.orderStatus) queryParams.orderStatus = filters.orderStatus;
    if (filters.fromDate) queryParams.fromDate = filters.fromDate;
    if (filters.toDate) queryParams.toDate = filters.toDate;

    try {
      await dispatch(fetchMyOrdersThunk(queryParams)).unwrap();
    } catch (err) {
      toast.error("Loi", err?.message || "Khong the tai danh sach don hang.");
    }
  }, [dispatch, filters, toast]);

  const fetchKpiData = useCallback(async () => {
    try {
      await dispatch(fetchOwnOrderKpisThunk(getTodayDateString())).unwrap();
    } catch (err) {
      console.error("Failed to fetch KPI data:", err);
    }
  }, [dispatch]);

  useEffect(() => {
    void fetchOrdersData();
  }, [fetchOrdersData]);

  useEffect(() => {
    void fetchKpiData();
  }, [fetchKpiData]);

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  return {
    orders,
    loading: listStatus === "loading",
    error: error?.message || error || null,
    kpis,
    filters,
    pagination,
    handlePageChange,
    handleFilterChange,
    clearFilters,
    refetch: () => {
      void fetchOrdersData();
      void fetchKpiData();
    },
  };
};
