import dayjs from "dayjs";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPaymentKpisThunk,
  fetchPaymentsThunk,
} from "../redux/paymentSlice";
import useAppToast from "@/hooks/useAppToast";

export const getPaymentDisplayDate = (payment) =>
  payment?.paymentStatus === "Paid"
    ? payment?.paidAt || payment?.createdAt || null
    : payment?.createdAt || null;

export const usePaymentList = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  const payments = useSelector((state) => state.payment.paymentList);
  const pagination = useSelector((state) => state.payment.paymentPagination);
  const listStatus = useSelector((state) => state.payment.listStatus);
  const error = useSelector((state) => state.payment.listError);
  const kpis = useSelector((state) => state.payment.paymentKpis);

  const [filters, setFilters] = useState({
    search: "",
    paymentStatus: "",
    paymentMethod: "",
    page: 1,
    limit: 10,
  });

  const fetchPayments = useCallback(async () => {
    const queryParams = {
      page: filters.page,
      limit: filters.limit,
      search: filters.search || undefined,
      paymentStatus: filters.paymentStatus || undefined,
      paymentMethod: filters.paymentMethod || undefined,
    };

    try {
      await dispatch(fetchPaymentsThunk(queryParams)).unwrap();
    } catch (err) {
      toast.error("Lỗi", err?.message || "Không thể tải danh sách thanh toán.");
    }
  }, [dispatch, filters, toast]);

  const fetchKpis = useCallback(async () => {
    try {
      await dispatch(fetchPaymentKpisThunk(dayjs().format("YYYY-MM-DD"))).unwrap();
    } catch (err) {
      console.error("Failed to fetch payment KPIs:", err);
    }
  }, [dispatch]);

  useEffect(() => {
    void fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    void fetchKpis();
  }, [fetchKpis]);

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
    payments,
    loading: listStatus === "loading",
    error: error?.message || error || null,
    kpis,
    filters,
    pagination,
    getPaymentDisplayDate,
    handleSearch,
    handlePageChange,
    handleFilterChange,
    refetch: () => {
      void fetchPayments();
      void fetchKpis();
    },
  };
};
