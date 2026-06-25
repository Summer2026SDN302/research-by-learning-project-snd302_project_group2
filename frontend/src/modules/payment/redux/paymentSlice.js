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

const KPI_PAGE_SIZE = 200;

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
  let totalPages = 1;

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

export const initiatePaymentThunk = createAsyncThunk(
  "payment/initiatePayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      return await paymentApi.initiatePayment(paymentData);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const confirmPaymentThunk = createAsyncThunk(
  "payment/confirmPayment",
  async ({ id, confirmData }, { rejectWithValue }) => {
    try {
      return await paymentApi.confirmPayment(id, confirmData);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const failPaymentThunk = createAsyncThunk(
  "payment/failPayment",
  async ({ id, failData }, { rejectWithValue }) => {
    try {
      return await paymentApi.failPayment(id, failData);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const initialState = {
  currentPayment: null,
  status: "idle",
  error: null,
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
    resetPaymentState(state) {
      state.currentPayment = null;
      state.status = "idle";
      state.error = null;
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

      .addCase(initiatePaymentThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(initiatePaymentThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentPayment = action.payload;
      })
      .addCase(initiatePaymentThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(confirmPaymentThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(confirmPaymentThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentPayment = action.payload;
      })
      .addCase(confirmPaymentThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(failPaymentThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(failPaymentThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentPayment = action.payload;
      })
      .addCase(failPaymentThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetPaymentState } = paymentSlice.actions;

export default paymentSlice.reducer;
