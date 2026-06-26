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
  pendingOrdersCount: 0,
};

const KPI_PAGE_SIZE = 200;

// [CHƯA CÓ BE] Logic kiểm tra order có thể tái sử dụng (update items).
// BE chưa có endpoint PATCH /api/orders/:id/items nên tạm comment.
// const canReuseCurrentOrder = (order) =>
//   Boolean(order?._id) &&
//   order.paymentStatus !== "Paid" &&
//   order.orderStatus !== "Completed" &&
//   order.orderStatus !== "Returned" &&
//   order.orderStatus !== "Cancelled";

// [CHƯA CÓ BE] field orderedAt chưa có trong Order model BE.
// BE trả về createdAt và orderDate.
const getOrderReferenceDate = (order) => order?.orderDate || order?.createdAt || null;

const toDateKey = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : null);

/**
 * Tính KPI từ danh sách orders.
 * Lưu ý: BE chưa có field paymentStatus nên personalRevenue tạm tính từ
 * tất cả đơn Completed thay vì filter theo paymentStatus === "Paid".
 */
const buildOwnHistoryKpis = (orders) => ({
  todayOrdersCount: orders.length,
  personalRevenue: orders
    // [CHƯA CÓ BE] paymentStatus chưa có trong Order model.
    // Tạm dùng orderStatus === "Completed" để tính doanh thu.
    .filter((item) => item.orderStatus === "Completed")
    .reduce((sum, item) => sum + (item.totalAmount || 0), 0),
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

/**
 * Lấy tất cả đơn hàng — dành cho Admin/Manager
 * Gọi GET /api/orders
 */
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

/**
 * Lấy đơn hàng của chính mình — dành cho Staff/Manager
 * Gọi GET /api/orders/my-orders
 */
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

/**
 * Tính KPI cho trang "Đơn của tôi"
 * Gọi GET /api/orders/my-orders với tất cả pages
 */
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

/**
 * Tạo đơn hàng mới — gọi POST /api/orders
 * Payload: { items: [{ foodItemId, quantity }] }
 * BE tự tính giá, thuế, tổng tiền từ daily menu hôm nay.
 */
export const submitOrder = createAsyncThunk(
  "order/submitOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      // [CHƯA CÓ BE] Logic updateOrderItems khi canReuseCurrentOrder.
      // BE chưa có PATCH /api/orders/:id/items nên luôn tạo order mới.
      // const currentOrder = getState().order.currentOrder;
      // if (canReuseCurrentOrder(currentOrder)) {
      //   return await orderApi.updateOrderItems(currentOrder._id, orderData);
      // }

      return await orderApi.createOrder(orderData);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// [CHƯA CÓ BE] cancelOrderThunk — BE chưa có endpoint PATCH /api/orders/:id/cancel.
// Hiện tại để hủy đơn, dùng updateOrderStatus(id, "Cancelled") qua route PATCH /api/orders/:id/status.
// export const cancelOrderThunk = createAsyncThunk(
//   "order/cancelOrder",
//   async (id, { rejectWithValue }) => {
//     try {
//       return await orderApi.cancelOrder(id);
//     } catch (error) {
//       return rejectWithValue(error);
//     }
//   },
// );

const initialState = {
  cart: {
    items: [], // Array of { foodItemId, name, unitPrice, quantity }
    // [CHƯA CÓ BE] field note cho từng item — BE chưa hỗ trợ
  },
  currentOrder: null, // Order returned from backend after creation
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

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    addToCart(state, action) {
      const { foodItemId, name, unitPrice, quantity = 1 } = action.payload;
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
          // [CHƯA CÓ BE] note — BE chưa hỗ trợ field note cho từng item
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
      const item = state.cart.items.find((item) => item.foodItemId === foodItemId);
      if (item) {
        if (quantity <= 0) {
          state.cart.items = state.cart.items.filter(
            (cartItem) => cartItem.foodItemId !== foodItemId,
          );
        } else {
          item.quantity = quantity;
        }
      }
    },
    // [CHƯA CÓ BE] updateCartItemNote — BE chưa hỗ trợ field note cho từng item
    // updateCartItemNote(state, action) {
    //   const { foodItemId, note } = action.payload;
    //   const item = state.cart.items.find((cartItem) => cartItem.foodItemId === foodItemId);
    //   if (item) {
    //     item.note = note || null;
    //   }
    // },
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

      // fetchMyOrdersThunk — dùng cho Staff/Manager xem đơn của chính mình
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

      .addCase(submitOrder.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentOrder = action.payload;
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

      // [CHƯA CÓ BE] cancelOrderThunk cases — comment vì BE chưa có cancel endpoint
      // .addCase(cancelOrderThunk.pending, (state) => {
      //   state.status = "loading";
      //   state.error = null;
      // })
      // .addCase(cancelOrderThunk.fulfilled, (state, action) => {
      //   state.status = "succeeded";
      //   state.currentOrder = action.payload;
      // })
      // .addCase(cancelOrderThunk.rejected, (state, action) => {
      //   state.status = "failed";
      //   state.error = action.payload;
      // });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  // [CHƯA CÓ BE] updateCartItemNote,
  clearCart,
  resetOrderState,
  setCurrentOrder,
} = orderSlice.actions;

export default orderSlice.reducer;
