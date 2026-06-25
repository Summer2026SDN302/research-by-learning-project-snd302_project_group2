import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/modules/menu/redux/categorySlice";
import { fetchTodayMenu } from "@/modules/menu/redux/dailyMenuSlice";
import {
  addToCart,
  cancelOrderThunk,
  removeFromCart,
  updateCartItemQuantity,
  updateCartItemNote,
  clearCart,
  submitOrder,
} from "../redux/orderSlice";
import useAppToast from "@/hooks/useAppToast";

const MENU_ERROR_MESSAGE = "Không thể tải dữ liệu thực đơn hôm nay.";

const canCancelCurrentOrder = (order) =>
  Boolean(order?._id) &&
  order.paymentStatus !== "Paid" &&
  order.paymentStatus !== "Pending" &&
  order.orderStatus !== "Completed" &&
  order.orderStatus !== "Returned" &&
  order.orderStatus !== "Cancelled";

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
        dispatch(fetchTodayMenu()).unwrap(),
        dispatch(fetchCategories({ isActive: true, limit: 100 }))
          .unwrap()
          .catch(() => null),
      ]);
    } finally {
      setHasInitialized(true);
    }
  }, [dispatch]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (currentOrder) {
      setOrderNotes(currentOrder.notes || "");
    }
  }, [currentOrder?._id, currentOrder?.notes]);

  const filteredMenuItems = useMemo(() => {
    if (!todayMenu?.items) return [];

    let items = todayMenu.items;

    if (selectedCategoryId) {
      items = items.filter(
        (item) => item.foodItemId?.categoryId === selectedCategoryId,
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

  const cartTotals = useMemo(() => {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const taxRate = currentOrder?.taxRate ?? 0.08;
    const taxAmount = Math.round(subtotal * taxRate);
    const totalAmount = subtotal + taxAmount;

    return {
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
    };
  }, [cart.items, currentOrder?.taxRate]);

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

  const cancelActiveOrderIfNeeded = useCallback(async () => {
    if (!canCancelCurrentOrder(currentOrder)) {
      return true;
    }

    try {
      await dispatch(cancelOrderThunk(currentOrder._id)).unwrap();
      return true;
    } catch (err) {
      toast.error(
        "Hủy đơn nháp thất bại",
        normalizeErrorMessage(err, "Không thể hủy đơn nháp hiện tại."),
      );
      return false;
    }
  }, [currentOrder, dispatch, toast]);

  const handleRemoveItem = useCallback(
    async (foodItemId) => {
      const willEmptyCart = cart.items.length === 1;

      if (willEmptyCart) {
        const cancelled = await cancelActiveOrderIfNeeded();

        if (!cancelled) {
          return false;
        }
      }

      dispatch(removeFromCart(foodItemId));

      if (willEmptyCart) {
        setOrderNotes("");
      }

      return true;
    },
    [cancelActiveOrderIfNeeded, cart.items.length, dispatch],
  );

  const handleUpdateQuantity = useCallback(
    async (foodItemId, quantity) => {
      const targetItem = cart.items.find((item) => item.foodItemId === foodItemId);
      const willEmptyCart =
        quantity <= 0 && cart.items.length === 1 && targetItem?.foodItemId === foodItemId;

      if (willEmptyCart) {
        const cancelled = await cancelActiveOrderIfNeeded();

        if (!cancelled) {
          return false;
        }
      }

      dispatch(updateCartItemQuantity({ foodItemId, quantity }));

      if (willEmptyCart) {
        setOrderNotes("");
      }

      return true;
    },
    [cancelActiveOrderIfNeeded, cart.items, dispatch],
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

  const handleClearCart = useCallback(
    async (options = {}) => {
      if (!options.skipCancel) {
        const cancelled = await cancelActiveOrderIfNeeded();

        if (!cancelled) {
          return false;
        }
      }

      dispatch(clearCart());
      setOrderNotes("");
      return true;
    },
    [cancelActiveOrderIfNeeded, dispatch],
  );

  const handleSubmitOrder = useCallback(
    async (notes = "") => {
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
        notes: notes || null,
        taxRate: cartTotals.taxRate,
      };

      try {
        return await dispatch(submitOrder(orderPayload)).unwrap();
      } catch (err) {
        toast.error(
          "Tạo đơn hàng thất bại",
          normalizeErrorMessage(err, "Đã xảy ra lỗi khi lưu đơn."),
        );
        return null;
      }
    },
    [cart.items, cartTotals.taxRate, dispatch, toast],
  );

  const handleCheckout = useCallback(
    async (method, onCheckoutReady) => {
      if (cart.items.length === 0) return;

      const activeOrder = await handleSubmitOrder(orderNotes);

      if (activeOrder) {
        onCheckoutReady(activeOrder, method);
      }
    },
    [cart.items.length, handleSubmitOrder, orderNotes],
  );

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
    handleCheckout,
    submitStatus,
    submitError,
    currentOrder,
    refetchMenu: fetchData,
  };
};
