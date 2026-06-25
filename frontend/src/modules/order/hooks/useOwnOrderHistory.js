import dayjs from "dayjs";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrdersThunk,
  fetchOwnOrderKpisThunk,
} from "../redux/orderSlice";
import useAppToast from "@/hooks/useAppToast";

const getTodayDateString = () => dayjs().format("YYYY-MM-DD");

export const useOwnOrderHistory = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  const orders = useSelector((state) => state.order.orderList);
  const pagination = useSelector((state) => state.order.orderPagination);
  const listStatus = useSelector((state) => state.order.listStatus);
  const error = useSelector((state) => state.order.listError);
  const kpis = useSelector((state) => state.order.ownHistoryKpis);

  const [filters, setFilters] = useState({
    search: "",
    orderStatus: "",
    paymentStatus: "",
    page: 1,
    limit: 10,
  });

  const fetchOrdersData = useCallback(async () => {
    const queryParams = {
      page: filters.page,
      limit: filters.limit,
      search: filters.search || undefined,
      orderStatus: filters.orderStatus || undefined,
      paymentStatus: filters.paymentStatus || undefined,
    };

    try {
      await dispatch(fetchOrdersThunk(queryParams)).unwrap();
    } catch (err) {
      toast.error("Lỗi", err?.message || "Không thể tải danh sách đơn hàng.");
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

  const handleSearch = (searchKeyword) => {
    setFilters((prev) => ({ ...prev, search: searchKeyword, page: 1 }));
  };

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
    handleSearch,
    handlePageChange,
    handleFilterChange,
    refetch: () => {
      void fetchOrdersData();
      void fetchKpiData();
    },
  };
};
