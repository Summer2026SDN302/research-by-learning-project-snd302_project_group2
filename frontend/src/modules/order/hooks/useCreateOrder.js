import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as dailyMenuApi from "../../menu/api/dailyMenuApi";
import * as orderApi from "../api/orderApi";
import {
  addItem,
  removeItem,
  increaseQty,
  decreaseQty,
  clearCart,
  setSubmitting,
  setCategoryFilter,
  setSearchTerm,
  setPaymentMethod,
  resetOrder,
  selectCart,
  selectIsSubmitting,
  selectCategoryFilter,
  selectSearchTerm,
  selectPaymentMethod,
} from "../redux/orderSlice";
import { TAX_PERCENT, ORDER_ERROR_MAP } from "../constants/orderConstants";
import useAppToast from "../../../hooks/useAppToast";
import { getApiErrorMsg } from "../../../utils/errorUtils";

/**
 * useCreateOrder
 *
 * Main hook for POS page — fetches today's menu, manages cart, and submits orders.
 * Follows Page → Hook → Redux → API architecture.
 */
const useCreateOrder = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  // ── Redux selectors ────────────────────────────────────────────────────────
  const cart = useSelector(selectCart);
  const isSubmitting = useSelector(selectIsSubmitting);
  const categoryFilter = useSelector(selectCategoryFilter);
  const searchTerm = useSelector(selectSearchTerm);
  const paymentMethod = useSelector(selectPaymentMethod);

  // ── Local state for menu data (no need to persist in Redux) ────────────────
  const [menuItems, setMenuItems] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState(null);

  // ── Fetch today's menu on mount ────────────────────────────────────────────
  const fetchTodayMenu = useCallback(async () => {
    setIsLoadingMenu(true);
    setMenuError(null);
    try {
      const data = await dailyMenuApi.getTodayMenu();
      setMenuItems(data?.items ?? []);
    } catch (err) {
      const code = err?.response?.data?.errorCode;
      if (code === "DAILY_MENU_NOT_FOUND") {
        setMenuItems([]);
        setMenuError("Thực đơn hôm nay chưa được tạo.");
      } else {
        setMenuError(getApiErrorMsg(ORDER_ERROR_MAP, err));
      }
    } finally {
      setIsLoadingMenu(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayMenu();
  }, [fetchTodayMenu]);

  // Reset order state when unmounting
  useEffect(() => {
    return () => {
      dispatch(setCategoryFilter(""));
      dispatch(setSearchTerm(""));
    };
  }, [dispatch]);

  // ── Extract unique categories from menu items ──────────────────────────────
  const categories = useMemo(() => {
    const catMap = new Map();
    for (const item of menuItems) {
      const cat = item.foodItemId?.categoryId;
      if (cat && !catMap.has(cat._id)) {
        catMap.set(cat._id, { id: cat._id, name: cat.name });
      }
    }
    return Array.from(catMap.values());
  }, [menuItems]);

  // ── Filter menu items by category + search ─────────────────────────────────
  const filteredMenuItems = useMemo(() => {
    let items = menuItems;

    if (categoryFilter) {
      items = items.filter(
        (item) => item.foodItemId?.categoryId?._id === categoryFilter,
      );
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter((item) => {
        const name = item.foodItemId?.name ?? "";
        return name.toLowerCase().includes(q);
      });
    }

    return items;
  }, [menuItems, categoryFilter, searchTerm]);

  // ── Cart calculations ──────────────────────────────────────────────────────
  const cartSubTotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [cart],
  );

  const cartTax = useMemo(
    () => Math.round(cartSubTotal * TAX_PERCENT * 100) / 100,
    [cartSubTotal],
  );

  const cartTotal = useMemo(
    () => Math.round((cartSubTotal + cartTax) * 100) / 100,
    [cartSubTotal, cartTax],
  );

  // ── Set of foodItemIds in cart for quick lookup ────────────────────────────
  const cartItemIds = useMemo(
    () => new Set(cart.map((i) => i.foodItemId)),
    [cart],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(
    (menuItem) => {
      const foodItem = menuItem.foodItemId;
      dispatch(
        addItem({
          foodItemId: foodItem._id,
          name: foodItem.name,
          unitPrice: menuItem.currentPrice,
        }),
      );
    },
    [dispatch],
  );

  const handleIncreaseQty = useCallback(
    (foodItemId) => dispatch(increaseQty(foodItemId)),
    [dispatch],
  );

  const handleDecreaseQty = useCallback(
    (foodItemId) => dispatch(decreaseQty(foodItemId)),
    [dispatch],
  );

  const handleRemoveItem = useCallback(
    (foodItemId) => dispatch(removeItem(foodItemId)),
    [dispatch],
  );

  const handleClearCart = useCallback(
    () => dispatch(clearCart()),
    [dispatch],
  );

  const handleCategoryChange = useCallback(
    (catId) => dispatch(setCategoryFilter(catId)),
    [dispatch],
  );

  const handleSearch = useCallback(
    (term) => dispatch(setSearchTerm(term)),
    [dispatch],
  );

  const handlePaymentMethodChange = useCallback(
    (method) => dispatch(setPaymentMethod(method)),
    [dispatch],
  );

  // ── Submit order ───────────────────────────────────────────────────────────
  const handleSubmitOrder = useCallback(async () => {
    if (cart.length === 0) {
      toast.warning("Giỏ hàng trống", "Vui lòng chọn ít nhất một món.");
      return;
    }

    dispatch(setSubmitting(true));
    try {
      const payload = {
        items: cart.map(({ foodItemId, quantity }) => ({
          foodItemId,
          quantity,
        })),
      };

      const newOrder = await orderApi.createOrder(payload);

      toast.success(
        "Tạo đơn thành công",
        `Đơn hàng #${newOrder?.orderNumber ?? ""} đã được tạo thành công.`,
      );
      dispatch(resetOrder());

      // Refetch menu to update remaining quantities
      await fetchTodayMenu();
    } catch (err) {
      const msg = getApiErrorMsg(ORDER_ERROR_MAP, err);
      toast.error("Tạo đơn thất bại", msg);
    } finally {
      dispatch(setSubmitting(false));
    }
  }, [cart, dispatch, toast, fetchTodayMenu]);

  return {
    // Menu data
    menuItems: filteredMenuItems,
    allMenuItems: menuItems,
    isLoadingMenu,
    menuError,
    categories,
    // Filters
    categoryFilter,
    searchTerm,
    handleCategoryChange,
    handleSearch,
    // Cart
    cart,
    cartItemIds,
    cartSubTotal,
    cartTax,
    cartTotal,
    handleAddToCart,
    handleIncreaseQty,
    handleDecreaseQty,
    handleRemoveItem,
    handleClearCart,
    // Payment
    paymentMethod,
    handlePaymentMethodChange,
    // Submit
    isSubmitting,
    handleSubmitOrder,
    // Refetch
    refetchMenu: fetchTodayMenu,
  };
};

export default useCreateOrder;
