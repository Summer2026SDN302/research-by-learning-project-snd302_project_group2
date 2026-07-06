import dayjs from "dayjs";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as orderApi from "../api/orderApi";

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const DEFAULT_OWN_HISTORY_KPIS = {
  todayOrdersCount: 0,
  personalRevenue: 0,
  completedOrdersCount: 0,
  pendingOrdersCount: 0,
};

const KPI_PAGE_SIZE = 50;

const getOrderReferenceDate = (order) =>
  order?.createdAt || order?.orderDate || null;

const toDateKey = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : null);

const buildOwnHistoryKpis = (orders) => ({
  todayOrdersCount: orders.length,
  personalRevenue: orders.reduce(
    (sum, item) =>
      sum +
      (item.orderStatus === "Completed"
        ? item.totalAmount || item.finalAmount || 0
        : 0),
    0,
  ),
  completedOrdersCount: orders.filter((item) => item.orderStatus === "Completed").length,
  pendingOrdersCount: orders.filter((item) => item.orderStatus === "Pending").length,
});

const fetchAllMyOrders = async (params = {}) => {
  const items = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await orderApi.getMyOrders({
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

const mapOrderItemToCartItem = (item) => ({
  foodItemId: item.foodItemId?._id || item.foodItemId,
  name: item.name,
  unitPrice: item.unitPrice,
  quantity: item.quantity,
  note: item.note ?? null,
});

export const isEditableOrder = (order) =>
  Boolean(
    order?._id &&
      order?.paymentStatus === "Unpaid" &&
      order?.orderStatus === "Pending",
  );

export const fetchOrdersThunk = createAsyncThunk(
  "order/fetchOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await orderApi.getOrders(params);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const fetchMyOrdersThunk = createAsyncThunk(
  "order/fetchMyOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await orderApi.getMyOrders(params);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const fetchOwnOrderKpisThunk = createAsyncThunk(
  "order/fetchOwnOrderKpis",
  async (orderDate, { rejectWithValue }) => {
    try {
      const targetDate = orderDate || dayjs().format("YYYY-MM-DD");
      const allOrders = await fetchAllMyOrders();
      const todayOrders = allOrders.filter(
        (item) => toDateKey(getOrderReferenceDate(item)) === targetDate,
      );

      return buildOwnHistoryKpis(todayOrders);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const submitOrder = createAsyncThunk(
  "order/submitOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      return await orderApi.createOrder(orderData);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateOrderItemsThunk = createAsyncThunk(
  "order/updateOrderItems",
  async ({ id, body }, { rejectWithValue }) => {
    try {
      return await orderApi.updateOrderItems(id, body);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const initialState = {
  cart: {
    items: [],
  },
  currentOrder: null,
  status: "idle",
  error: null,
  orderList: [],
  orderPagination: DEFAULT_PAGINATION,
  listStatus: "idle",
  listError: null,
  ownHistoryKpis: DEFAULT_OWN_HISTORY_KPIS,
  ownHistoryKpiStatus: "idle",
  ownHistoryKpiError: null,
};

const applySubmitPending = (state) => {
  state.status = "loading";
  state.error = null;
};

const applySubmitFulfilled = (state, action) => {
  state.status = "succeeded";
  state.currentOrder = action.payload;
};

const applySubmitRejected = (state, action) => {
  state.status = "failed";
  state.error = action.payload ?? action.error;
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    addToCart(state, action) {
      const {
        foodItemId,
        name,
        unitPrice,
        quantity = 1,
        note = null,
      } = action.payload;
      const existingItem = state.cart.items.find(
        (item) => item.foodItemId === foodItemId,
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cart.items.push({
          foodItemId,
          name,
          unitPrice,
          quantity,
          note,
        });
      }
    },
    removeFromCart(state, action) {
      const foodItemId = action.payload;
      state.cart.items = state.cart.items.filter(
        (item) => item.foodItemId !== foodItemId,
      );
    },
    updateCartItemQuantity(state, action) {
      const { foodItemId, quantity } = action.payload;
      const item = state.cart.items.find((entry) => entry.foodItemId === foodItemId);

      if (!item) {
        return;
      }

      if (quantity <= 0) {
        state.cart.items = state.cart.items.filter(
          (entry) => entry.foodItemId !== foodItemId,
        );
        return;
      }

      item.quantity = quantity;
    },
    updateCartItemNote(state, action) {
      const { foodItemId, note } = action.payload;
      const item = state.cart.items.find((entry) => entry.foodItemId === foodItemId);

      if (!item) {
        return;
      }

      item.note = note;
    },
    startEditingOrder(state, action) {
      const order = action.payload;
      state.currentOrder = order;
      state.cart.items = (order?.items || []).map(mapOrderItemToCartItem);
      state.status = "idle";
      state.error = null;
    },
    clearCart(state) {
      state.cart.items = [];
      state.currentOrder = null;
      state.status = "idle";
      state.error = null;
    },
    resetOrderState(state) {
      state.currentOrder = null;
      state.status = "idle";
      state.error = null;
    },
    setCurrentOrder(state, action) {
      state.currentOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersThunk.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.orderList = action.payload.items ?? [];
        state.orderPagination = action.payload.pagination ?? DEFAULT_PAGINATION;
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload ?? action.error;
      })
      .addCase(fetchMyOrdersThunk.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchMyOrdersThunk.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.orderList = action.payload.items ?? [];
        state.orderPagination = action.payload.pagination ?? DEFAULT_PAGINATION;
      })
      .addCase(fetchMyOrdersThunk.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload ?? action.error;
      })
      .addCase(fetchOwnOrderKpisThunk.pending, (state) => {
        state.ownHistoryKpiStatus = "loading";
        state.ownHistoryKpiError = null;
      })
      .addCase(fetchOwnOrderKpisThunk.fulfilled, (state, action) => {
        state.ownHistoryKpiStatus = "succeeded";
        state.ownHistoryKpis = action.payload ?? DEFAULT_OWN_HISTORY_KPIS;
      })
      .addCase(fetchOwnOrderKpisThunk.rejected, (state, action) => {
        state.ownHistoryKpiStatus = "failed";
        state.ownHistoryKpiError = action.payload ?? action.error;
      })
      .addCase(submitOrder.pending, applySubmitPending)
      .addCase(submitOrder.fulfilled, applySubmitFulfilled)
      .addCase(submitOrder.rejected, applySubmitRejected)
      .addCase(updateOrderItemsThunk.pending, applySubmitPending)
      .addCase(updateOrderItemsThunk.fulfilled, applySubmitFulfilled)
      .addCase(updateOrderItemsThunk.rejected, applySubmitRejected);
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  updateCartItemNote,
  startEditingOrder,
  clearCart,
  resetOrderState,
  setCurrentOrder,
} = orderSlice.actions;

export default orderSlice.reducer;
