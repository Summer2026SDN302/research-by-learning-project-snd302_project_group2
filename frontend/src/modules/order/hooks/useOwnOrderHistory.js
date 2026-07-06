import dayjs from "dayjs";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyOrdersThunk,
  fetchOwnOrderKpisThunk,
  cancelOrderThunk,
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
    // [CHƯA CÓ BE] search — BE chưa hỗ trợ tìm kiếm theo keyword
    orderStatus: "",
    fromDate: "", // Lọc từ ngày
    toDate: "",   // Lọc đến ngày
    // [CHƯA CÓ BE] paymentStatus — BE chưa có field paymentStatus trong Order model
    page: 1,
    limit: 10,
  });

  const clearFilters = () => {
    setFilters({
      orderStatus: "",
      fromDate: "",
      toDate: "",
      page: 1,
      limit: 10,
    });
  };

  /**
   * Gọi GET /api/orders/my-orders — BE tự ép staffId = req.userId
   * Khác với fetchOrdersThunk (GET /api/orders) chỉ dành cho Admin/Manager
   */
  const fetchOrdersData = useCallback(async () => {
    const queryParams = {
      page: filters.page,
      limit: filters.limit,
    };
    if (filters.orderStatus) queryParams.orderStatus = filters.orderStatus;
    if (filters.fromDate) queryParams.fromDate = filters.fromDate;
    if (filters.toDate) queryParams.toDate = filters.toDate;
    // [CHƯA CÓ BE] search
    // [CHƯA CÓ BE] paymentStatus

    try {
      await dispatch(fetchMyOrdersThunk(queryParams)).unwrap();
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

  // [CHƯA CÓ BE] handleSearch — BE chưa hỗ trợ search query param
  // const handleSearch = (searchKeyword) => {
  //   setFilters((prev) => ({ ...prev, search: searchKeyword, page: 1 }));
  // };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const executeCancelOrder = async (orderId) => {
    try {
      await dispatch(cancelOrderThunk(orderId)).unwrap();
      toast.success("Thành công", "Đã huỷ đơn hàng thành công!");
      fetchOrdersData();
      fetchKpiData();
      return true;
    } catch (err) {
      toast.error("Lỗi", err?.message || "Không thể huỷ đơn hàng.");
      return false;
    }
  };

  return {
    orders,
    loading: listStatus === "loading",
    error: error?.message || error || null,
    kpis,
    filters,
    pagination,
    executeCancelOrder,
    // [CHƯA CÓ BE] handleSearch,
    handlePageChange,
    handleFilterChange,
    clearFilters,
    refetch: () => {
      void fetchOrdersData();
      void fetchKpiData();
    },
  };
};
