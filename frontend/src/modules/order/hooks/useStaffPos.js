import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/modules/menu/redux/categorySlice";
import { fetchTodayMenu } from "@/modules/menu/redux/dailyMenuSlice";
import {
  addToCart,
  // [CHƯA CÓ BE] cancelOrderThunk — BE chưa có endpoint cancel riêng
  removeFromCart,
  updateCartItemQuantity,
  updateCartItemNote,
  clearCart,
  submitOrder,
} from "../redux/orderSlice";
import useAppToast from "@/hooks/useAppToast";
import { getApiErrorMsg } from "@/utils/errorUtils";
import { ORDER_ERROR_MAP } from "../constants/orderConstants";

const MENU_ERROR_MESSAGE = "Không thể tải dữ liệu thực đơn hôm nay.";

// [CHƯA CÓ BE] Logic cancel order nháp — BE chưa có endpoint cancel riêng
// và chưa có field paymentStatus trong Order model.
// const canCancelCurrentOrder = (order) =>
//   Boolean(order?._id) &&
//   order.paymentStatus !== "Paid" &&
//   order.paymentStatus !== "Pending" &&
//   order.orderStatus !== "Completed" &&
//   order.orderStatus !== "Returned" &&
//   order.orderStatus !== "Cancelled";

const normalizeErrorMessage = (error, fallback) =>
  error?.message || error?.response?.data?.message || fallback;

export const useStaffPos = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  const cart = useSelector((state) => state.order.cart);
  const submitStatus = useSelector((state) => state.order.status);
  const submitError = useSelector((state) => state.order.error);
  const currentOrder = useSelector((state) => state.order.currentOrder);

  const todayMenu = useSelector((state) => state.dailyMenu.menu);
  const dailyMenuLoading = useSelector((state) => state.dailyMenu.isLoading);
  const dailyMenuError = useSelector((state) => state.dailyMenu.error);

  const categories = useSelector((state) => state.category.items);
  const categoryListStatus = useSelector((state) => state.category.listStatus);

  const [hasInitialized, setHasInitialized] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  const fetchData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchTodayMenu({ isConfigured: true }))
          .unwrap()
          .catch((error) => {
            if (
              error?.response?.status === 404 ||
              error?.response?.data?.error?.code === "DAILY_MENU_NOT_FOUND" ||
              error?.errorCode === "DAILY_MENU_NOT_FOUND"
            ) {
              return null;
            }
            throw error;
          }),
        dispatch(fetchCategories({ isActive: true, limit: 50 }))
          .unwrap()
          .catch(() => null),
      ]);
    } catch {
      // Errors are handled and stored in Redux store (dailyMenu.error / category.error)
    } finally {
      setHasInitialized(true);
    }
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        void fetchData();
      }
    });
    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  const [prevOrderId, setPrevOrderId] = useState(null);
  const [prevOrderNotes, setPrevOrderNotes] = useState(null);

  const currentOrderId = currentOrder?._id ?? null;
  const currentOrderNotes = currentOrder?.notes ?? null;

  if (currentOrderId !== prevOrderId || currentOrderNotes !== prevOrderNotes) {
    setPrevOrderId(currentOrderId);
    setPrevOrderNotes(currentOrderNotes);
    setOrderNotes(currentOrder?.notes || "");
  }

  const filteredMenuItems = useMemo(() => {
    if (!todayMenu?.items) return [];

    let items = todayMenu.items;

    if (selectedCategoryId) {
      items = items.filter((item) => {
        const catId =
          item.foodItemId?.categoryId?._id || item.foodItemId?.categoryId;
        return catId === selectedCategoryId;
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((item) =>
        item.foodItemId?.name?.toLowerCase().includes(q),
      );
    }

    return items;
  }, [todayMenu, selectedCategoryId, searchQuery]);

  /**
   * Tính tổng giỏ hàng.
   * TAX_PERCENT = 0.08 (8%) — khớp với BE order.constants.js
   */
  const cartTotals = useMemo(() => {
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const taxRate = 0.08; // Khớp với BE TAX_PERCENT
    const taxAmount = Math.round(totalAmount - totalAmount / (1 + taxRate));
    const subtotal = totalAmount - taxAmount;

    return {
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
    };
  }, [cart.items]);

  const handleAddItem = useCallback(
    (foodItem, currentPrice) => {
      dispatch(
        addToCart({
          foodItemId: foodItem._id,
          name: foodItem.name,
          unitPrice: currentPrice,
          quantity: 1,
        }),
      );
    },
    [dispatch],
  );

  // [CHƯA CÓ BE] cancelActiveOrderIfNeeded — BE chưa có endpoint cancel riêng.
  // Logic này sẽ được bật lại khi BE bổ sung PATCH /api/orders/:id/cancel.
  // const cancelActiveOrderIfNeeded = useCallback(async () => {
  //   if (!canCancelCurrentOrder(currentOrder)) {
  //     return true;
  //   }
  //   try {
  //     await dispatch(cancelOrderThunk(currentOrder._id)).unwrap();
  //     return true;
  //   } catch (err) {
  //     toast.error(
  //       "Hủy đơn nháp thất bại",
  //       normalizeErrorMessage(err, "Không thể hủy đơn nháp hiện tại."),
  //     );
  //     return false;
  //   }
  // }, [currentOrder, dispatch, toast]);

  const handleRemoveItem = useCallback(
    (foodItemId) => {
      // Đơn giản hóa: bỏ logic cancelActiveOrderIfNeeded vì BE chưa có
      dispatch(removeFromCart(foodItemId));
      return true;
    },
    [dispatch],
  );

  const handleUpdateQuantity = useCallback(
    (foodItemId, quantity) => {
      // Đơn giản hóa: bỏ logic cancelActiveOrderIfNeeded vì BE chưa có
      dispatch(updateCartItemQuantity({ foodItemId, quantity }));
      return true;
    },
    [dispatch],
  );

  const handleUpdateNote = useCallback(
    (foodItemId, note) => {
      dispatch(updateCartItemNote({ foodItemId, note }));
    },
    [dispatch],
  );

  const handleOrderNotesChange = useCallback((value) => {
    setOrderNotes(value);
  }, []);

  const handleClearCart = useCallback(() => {
    // Đơn giản hóa: bỏ logic cancelActiveOrderIfNeeded vì BE chưa có
    dispatch(clearCart());
    return true;
  }, [dispatch]);

  /**
   * Submit order lên BE.
   * Payload chỉ gửi { items: [{ foodItemId, quantity }] }
   * BE tự tính giá từ daily menu, thuế 8%, tổng tiền.
   */
  const handleSubmitOrder = useCallback(async () => {
    if (cart.items.length === 0) {
      toast.error("Không thể tạo đơn", "Giỏ hàng của bạn đang trống.");
      return null;
    }

    const orderPayload = {
      items: cart.items.map((item) => ({
        foodItemId: item.foodItemId,
        quantity: item.quantity,
        note: item.note,
      })),
      notes: orderNotes,
      // [CHƯA CÓ BE] taxRate — BE tự tính thuế từ constants
    };

    try {
      const result = await dispatch(submitOrder(orderPayload)).unwrap();
      toast.success(
        "Tạo đơn thành công",
        `Đơn hàng #${result?.orderNumber ?? ""} đã được tạo.`,
      );
      // Reset cart sau khi tạo đơn thành công
      dispatch(clearCart());
      // Refetch menu để cập nhật số lượng còn lại
      await fetchData();
      return result;
    } catch (err) {
      toast.error(
        "Tạo đơn hàng thất bại",
        getApiErrorMsg(ORDER_ERROR_MAP, err, "Đã xảy ra lỗi khi lưu đơn."),
      );
      return null;
    }
  }, [cart.items, dispatch, toast, fetchData, orderNotes]);

  // [CHƯA CÓ BE] handleCheckout mở PaymentModal — module Payment chưa có ở BE.
  // Tạm thời handleCheckout chỉ gọi handleSubmitOrder trực tiếp.
  // Khi BE có module Payment, sẽ bật lại logic mở PaymentModal.
  // const handleCheckout = useCallback(
  //   async (method, onCheckoutReady) => {
  //     if (cart.items.length === 0) return;
  //     const activeOrder = await handleSubmitOrder(orderNotes);
  //     if (activeOrder) {
  //       onCheckoutReady(activeOrder, method);
  //     }
  //   },
  //   [cart.items.length, handleSubmitOrder, orderNotes],
  // );

  return {
    todayMenu,
    categories,
    loadingMenu:
      !hasInitialized || dailyMenuLoading || categoryListStatus === "loading",
    menuError: dailyMenuError
      ? normalizeErrorMessage(dailyMenuError, MENU_ERROR_MESSAGE)
      : null,
    selectedCategoryId,
    setSelectedCategoryId,
    searchQuery,
    setSearchQuery,
    filteredMenuItems,
    cart,
    cartTotals,
    orderNotes,
    handleOrderNotesChange,
    handleAddItem,
    handleRemoveItem,
    handleUpdateQuantity,
    handleUpdateNote,
    handleClearCart,
    handleSubmitOrder,
    // [CHƯA CÓ BE] handleCheckout — dùng handleSubmitOrder trực tiếp
    submitStatus,
    submitError,
    currentOrder,
    refetchMenu: fetchData,
  };
};
