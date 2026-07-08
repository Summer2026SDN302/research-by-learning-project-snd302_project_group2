import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/modules/menu/redux/categorySlice";
import * as dailyMenuApi from "../../menu/api/dailyMenuApi";
import {
  addToCart,
  // [CHƯA CÓ BE] cancelOrderThunk — BE chưa có endpoint cancel riêng
  removeFromCart,
  updateCartItemQuantity,
  // [CHƯA CÓ BE] updateCartItemNote — BE chưa hỗ trợ field note
  clearCart,
  submitOrder,
} from "../redux/orderSlice";
import useAppToast from "@/hooks/useAppToast";

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
  
  const [todayMenu, setTodayMenu] = useState(null);
  const [dailyMenuLoading, setDailyMenuLoading] = useState(false);
  const [dailyMenuError, setDailyMenuError] = useState(null);
  
  const categories = useSelector((state) => state.category.items);
  const categoryListStatus = useSelector((state) => state.category.listStatus);

  const [hasInitialized, setHasInitialized] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // [CHƯA CÓ BE] orderNotes — BE chưa hỗ trợ field notes cho order
  // const [orderNotes, setOrderNotes] = useState("");

  const fetchData = useCallback(async () => {
    setDailyMenuLoading(true);
    setDailyMenuError(null);
    try {
      const [menuData] = await Promise.all([
        dailyMenuApi.getTodayMenu({ isConfigured: true }).catch((error) => {
          if (
            error?.response?.status === 404 ||
            error?.response?.data?.error?.code === "DAILY_MENU_NOT_FOUND"
          ) {
            return null;
          }
          throw error;
        }),
        dispatch(fetchCategories({ isActive: true, limit: 50 }))
          .unwrap()
          .catch(() => null),
      ]);
      setTodayMenu(menuData);
    } catch (err) {
      setDailyMenuError(err);
    } finally {
      setDailyMenuLoading(false);
      setHasInitialized(true);
    }
  }, [dispatch]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // [CHƯA CÓ BE] Sync orderNotes khi currentOrder thay đổi
  // useEffect(() => {
  //   if (currentOrder) {
  //     setOrderNotes(currentOrder.notes || "");
  //   }
  // }, [currentOrder?._id, currentOrder?.notes]);

  const filteredMenuItems = useMemo(() => {
    if (!todayMenu?.items) return [];

    let items = todayMenu.items;

    if (selectedCategoryId) {
      items = items.filter(
        (item) => {
          const catId = item.foodItemId?.categoryId?._id || item.foodItemId?.categoryId;
          return catId === selectedCategoryId;
        }
      );
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
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const taxRate = 0.08; // Khớp với BE TAX_PERCENT
    const taxAmount = Math.round(subtotal * taxRate);
    const totalAmount = subtotal + taxAmount;

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

  // [CHƯA CÓ BE] handleUpdateNote — BE chưa hỗ trợ field note cho item
  // const handleUpdateNote = useCallback(
  //   (foodItemId, note) => {
  //     dispatch(updateCartItemNote({ foodItemId, note }));
  //   },
  //   [dispatch],
  // );

  // [CHƯA CÓ BE] handleOrderNotesChange — BE chưa hỗ trợ field notes
  // const handleOrderNotesChange = useCallback((value) => {
  //   setOrderNotes(value);
  // }, []);

  const handleClearCart = useCallback(
    () => {
      // Đơn giản hóa: bỏ logic cancelActiveOrderIfNeeded vì BE chưa có
      dispatch(clearCart());
      return true;
    },
    [dispatch],
  );

  /**
   * Submit order lên BE.
   * Payload chỉ gửi { items: [{ foodItemId, quantity }] }
   * BE tự tính giá từ daily menu, thuế 8%, tổng tiền.
   */
  const handleSubmitOrder = useCallback(
    async () => {
      if (cart.items.length === 0) {
        toast.error("Không thể tạo đơn", "Giỏ hàng của bạn đang trống.");
        return null;
      }

      const orderPayload = {
        items: cart.items.map((item) => ({
          foodItemId: item.foodItemId,
          quantity: item.quantity,
          // [CHƯA CÓ BE] note — BE chưa hỗ trợ
        })),
        // [CHƯA CÓ BE] notes — BE chưa hỗ trợ field notes cho order
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
          normalizeErrorMessage(err, "Đã xảy ra lỗi khi lưu đơn."),
        );
        return null;
      }
    },
    [cart.items, dispatch, toast, fetchData],
  );

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
    // [CHƯA CÓ BE] orderNotes,
    // [CHƯA CÓ BE] handleOrderNotesChange,
    handleAddItem,
    handleRemoveItem,
    handleUpdateQuantity,
    // [CHƯA CÓ BE] handleUpdateNote,
    handleClearCart,
    handleSubmitOrder,
    // [CHƯA CÓ BE] handleCheckout — dùng handleSubmitOrder trực tiếp
    submitStatus,
    submitError,
    currentOrder,
    refetchMenu: fetchData,
  };
};
