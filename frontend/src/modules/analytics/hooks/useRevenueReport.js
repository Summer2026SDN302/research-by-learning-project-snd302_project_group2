import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import useDebouncedValue from "@/hooks/useDebouncedValue";
import {
  REPORT_PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
} from "../constants/analyticsConstants";
import {
  exportRevenueReportThunk,
  fetchTransactionReport,
  selectReportExportLoading,
  selectReportFilters,
  selectReportItems,
  selectReportLoading,
  selectReportPagination,
  selectReportSummary,
  setReportFilters,
  setReportPage,
} from "../redux/analyticsSlice";
import { getDateRangeFromPreset } from "../utils/dateRange";
import { downloadBlob } from "../utils/downloadBlob";

const buildReportParams = (filters, page) => {
  const params = {
    page,
    limit: REPORT_PAGE_SIZE,
  };

  if (filters.status) {
    params.status = filters.status;
  }
  if (filters.paymentMethod) {
    params.paymentMethod = filters.paymentMethod;
  }
  if (filters.from) {
    params.from = filters.from;
  }
  if (filters.to) {
    params.to = filters.to;
  }
  if (filters.search?.trim()) {
    params.search = filters.search.trim();
  }

  return params;
};

const useRevenueReport = () => {
  const dispatch = useDispatch();
  const summary = useSelector(selectReportSummary);
  const items = useSelector(selectReportItems);
  const pagination = useSelector(selectReportPagination);
  const filters = useSelector(selectReportFilters);
  const loading = useSelector(selectReportLoading);
  const exportLoading = useSelector(selectReportExportLoading);
  const [prevSearch, setPrevSearch] = useState(filters.search);
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

  if (filters.search !== prevSearch) {
    setPrevSearch(filters.search);
    setSearchInput(filters.search);
  }

  const queryParams = useMemo(
    () => buildReportParams(filters, pagination.page),
    [filters, pagination.page],
  );

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      dispatch(setReportFilters({ search: debouncedSearch }));
    }
  }, [dispatch, filters.search, debouncedSearch]);

  useEffect(() => {
    dispatch(fetchTransactionReport(queryParams));
  }, [dispatch, queryParams]);

  const setStatusFilter = useCallback(
    (status) => dispatch(setReportFilters({ status })),
    [dispatch],
  );

  const setPaymentMethod = useCallback(
    (paymentMethod) => dispatch(setReportFilters({ paymentMethod })),
    [dispatch],
  );

  const setDatePreset = useCallback(
    (datePreset) => {
      const { from, to } = getDateRangeFromPreset(datePreset);
      dispatch(setReportFilters({ datePreset, from, to }));
    },
    [dispatch],
  );

  const setPage = useCallback(
    (page) => dispatch(setReportPage(page)),
    [dispatch],
  );

  const handleExport = useCallback(async () => {
    try {
      const exportParams = buildReportParams(filters, pagination.page);
      delete exportParams.page;
      delete exportParams.limit;

      const response = await dispatch(
        exportRevenueReportThunk(exportParams),
      ).unwrap();

      downloadBlob(
        response,
        `revenue-report-${dayjs().format("YYYY-MM-DD")}.csv`,
      );
      toast.success("Xuất báo cáo thành công");
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Xuất báo cáo thất bại",
      );
    }
  }, [dispatch, filters, pagination.page]);

  return {
    summary,
    items,
    pagination,
    filters,
    loading,
    exportLoading,
    searchInput,
    setSearchInput,
    setStatusFilter,
    setPaymentMethod,
    setDatePreset,
    setPage,
    handleExport,
  };
};

export default useRevenueReport;
