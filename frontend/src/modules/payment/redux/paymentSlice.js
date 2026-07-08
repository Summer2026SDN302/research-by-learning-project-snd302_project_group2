import dayjs from "dayjs";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as paymentApi from "../api/paymentApi";

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const DEFAULT_PAYMENT_KPIS = {
  totalRevenue: 0,
  successCount: 0,
  pendingCount: 0,
};

const KPI_PAGE_SIZE = 50;

const getPaymentReferenceDate = (payment) =>
  payment?.paymentStatus === "Paid"
    ? payment?.paidAt || payment?.createdAt || null
    : payment?.createdAt || null;

const toDateKey = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : null);

const buildPaymentKpis = (payments) => ({
  totalRevenue: payments
    .filter((item) => item.paymentStatus === "Paid")
    .reduce((sum, item) => sum + (item.finalAmount || 0), 0),
  successCount: payments.filter((item) => item.paymentStatus === "Paid").length,
  pendingCount: payments.filter((item) => item.paymentStatus === "Pending").length,
});

const fetchAllPayments = async (params = {}) => {
  const items = [];
  let page = 1;
  let totalPages;

  do {
    const result = await paymentApi.getPayments({
      ...params,
      page,
      limit: KPI_PAGE_SIZE,
    });

    items.push(...(result.items || []));
    totalPages = result.pagination?.totalPages || 1;
    page += 1;
  } while (page <= totalPages);

  return items;
};

export const fetchPaymentsThunk = createAsyncThunk(
  "payment/fetchPayments",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await paymentApi.getPayments(params);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const fetchPaymentReceiptThunk = createAsyncThunk(
  "payment/fetchPaymentReceipt",
  async (paymentId, { rejectWithValue }) => {
    try {
      return await paymentApi.getPaymentReceipt(paymentId);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const printPaymentReceiptThunk = createAsyncThunk(
  "payment/printPaymentReceipt",
  async (paymentId, { rejectWithValue }) => {
    try {
      return await paymentApi.printPaymentReceipt(paymentId);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const fetchPaymentKpisThunk = createAsyncThunk(
  "payment/fetchPaymentKpis",
  async (dateKey, { rejectWithValue }) => {
    try {
      const targetDate = dateKey || dayjs().format("YYYY-MM-DD");
      const allPayments = await fetchAllPayments();
      const todayPayments = allPayments.filter(
        (item) => toDateKey(getPaymentReferenceDate(item)) === targetDate,
      );

      return buildPaymentKpis(todayPayments);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const checkoutPaymentThunk = createAsyncThunk(
  "payment/checkoutPayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      return await paymentApi.checkoutPayment(paymentData);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const confirmPaymentThunk = createAsyncThunk(
  "payment/confirmPayment",
  async ({ paymentId, transactionCode }, { rejectWithValue }) => {
    try {
      return await paymentApi.confirmPayment(paymentId, { transactionCode });
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const initialState = {
  receipt: null,
  receiptStatus: "idle",
  receiptError: null,
  paymentList: [],
  paymentPagination: DEFAULT_PAGINATION,
  listStatus: "idle",
  listError: null,
  paymentKpis: DEFAULT_PAYMENT_KPIS,
  kpiStatus: "idle",
  kpiError: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPaymentReceiptState(state) {
      state.receipt = null;
      state.receiptStatus = "idle";
      state.receiptError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentsThunk.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchPaymentsThunk.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.paymentList = action.payload.items ?? [];
        state.paymentPagination = action.payload.pagination ?? DEFAULT_PAGINATION;
      })
      .addCase(fetchPaymentsThunk.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload ?? action.error;
      })

      .addCase(fetchPaymentReceiptThunk.pending, (state) => {
        state.receiptStatus = "loading";
        state.receiptError = null;
      })
      .addCase(fetchPaymentReceiptThunk.fulfilled, (state, action) => {
        state.receiptStatus = "succeeded";
        state.receipt = action.payload;
      })
      .addCase(fetchPaymentReceiptThunk.rejected, (state, action) => {
        state.receiptStatus = "failed";
        state.receiptError = action.payload ?? action.error;
      })

      .addCase(printPaymentReceiptThunk.pending, (state) => {
        state.receiptError = null;
      })
      .addCase(printPaymentReceiptThunk.fulfilled, (state, action) => {
        state.receipt = action.payload;
      })
      .addCase(printPaymentReceiptThunk.rejected, (state, action) => {
        state.receiptError = action.payload ?? action.error;
      })

      .addCase(fetchPaymentKpisThunk.pending, (state) => {
        state.kpiStatus = "loading";
        state.kpiError = null;
      })
      .addCase(fetchPaymentKpisThunk.fulfilled, (state, action) => {
        state.kpiStatus = "succeeded";
        state.paymentKpis = action.payload ?? DEFAULT_PAYMENT_KPIS;
      })
      .addCase(fetchPaymentKpisThunk.rejected, (state, action) => {
        state.kpiStatus = "failed";
        state.kpiError = action.payload ?? action.error;
      })

      .addCase(checkoutPaymentThunk.rejected, (state, action) => {
        state.receiptError = action.payload ?? action.error;
      });
  },
});

export const { resetPaymentReceiptState } = paymentSlice.actions;

export default paymentSlice.reducer;
