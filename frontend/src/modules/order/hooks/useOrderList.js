import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrdersThunk, cancelOrderThunk } from "../redux/orderSlice";
import useAppToast from "@/hooks/useAppToast";
import { getApiErrorMsg } from "@/utils/errorUtils";
import { ORDER_ERROR_MAP } from "../constants/orderConstants";

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

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    // [CHƯA CÓ BE] search — BE chưa hỗ trợ search query param
    orderStatus: "",
    fromDate: "", // Lọc từ ngày
    toDate: "", // Lọc đến ngày
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
      toast.error(
        "Lỗi",
        getApiErrorMsg(
          ORDER_ERROR_MAP,
          err,
          "Không thể tải danh sách đơn hàng.",
        ),
      );
    }
  }, [dispatch, filters, toast]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

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
      void fetchOrders();
      return true;
    } catch (err) {
      toast.error(
        "Lỗi",
        getApiErrorMsg(ORDER_ERROR_MAP, err, "Không thể huỷ đơn hàng."),
      );
      return false;
    }
  };

  const rows = useMemo(() => {
    const mapped = orders.map((order) => ({
      id: order._id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      staffName:
        order.staffId?.fullName ||
        order.staffId?.username ||
        (typeof order.staffId === "string" ? order.staffId.slice(-6) : "N/A"),
      totalAmount: order.totalAmount,
      orderStatus: order.orderStatus,
      _raw: order,
    }));

    if (!searchQuery.trim()) return mapped;

    const query = searchQuery.toLowerCase().trim();
    return mapped.filter((r) => {
      return (
        r.orderNumber?.toLowerCase().includes(query) ||
        r.staffName?.toLowerCase().includes(query)
      );
    });
  }, [orders, searchQuery]);

  return {
    orders,
    rows,
    searchQuery,
    setSearchQuery,
    loading: listStatus === "loading",
    error: error?.message || error || null,
    filters,
    pagination,
    executeCancelOrder,
    handlePageChange,
    handleFilterChange,
    clearFilters,
    refetch: fetchOrders,
  };
};
