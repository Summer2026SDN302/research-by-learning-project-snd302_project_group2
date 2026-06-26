import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrdersThunk } from "../redux/orderSlice";
import useAppToast from "@/hooks/useAppToast";

/**
 * Hook cho trang "Quản lý đơn hàng" — dành cho Admin/Manager
 * Gọi GET /api/orders (xem tất cả đơn trong hệ thống)
 */
export const useOrderList = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  const orders = useSelector((state) => state.order.orderList);
  const pagination = useSelector((state) => state.order.orderPagination);
  const listStatus = useSelector((state) => state.order.listStatus);
  const error = useSelector((state) => state.order.listError);

  const [filters, setFilters] = useState({
    // [CHƯA CÓ BE] search — BE chưa hỗ trợ search query param
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

  const fetchOrders = useCallback(async () => {
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
      await dispatch(fetchOrdersThunk(queryParams)).unwrap();
    } catch (err) {
      toast.error("Lỗi", err?.message || "Không thể tải danh sách đơn hàng.");
    }
  }, [dispatch, filters, toast]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

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

  return {
    orders,
    loading: listStatus === "loading",
    error: error?.message || error || null,
    filters,
    pagination,
    // [CHƯA CÓ BE] handleSearch,
    handlePageChange,
    handleFilterChange,
    clearFilters,
    refetch: fetchOrders,
  };
};
