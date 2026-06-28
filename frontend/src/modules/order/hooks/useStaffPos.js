import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { fetchCategories } from "@/modules/menu/redux/categorySlice";
import { fetchTodayMenu } from "@/modules/menu/redux/dailyMenuSlice";
import { buildCartPreviewTotals } from "../utils/orderPreview";
import {
  addToCart,
  clearCart,
  isEditableOrder,
  removeFromCart,
  startEditingOrder,
  submitOrder,
  updateCartItemNote,
  updateCartItemQuantity,
  updateOrderItemsThunk,
} from "../redux/orderSlice";
import useAppToast from "@/hooks/useAppToast";

const MENU_ERROR_MESSAGE = "Khong the tai du lieu thuc don hom nay.";

const normalizeErrorMessage = (error, fallback) =>
  error?.message || error?.response?.data?.message || fallback;

const normalizeEntityId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return value._id || value;
};

export const useStaffPos = () => {
  const dispatch = useDispatch();
  const store = useStore();
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

  const editingOrder = isEditableOrder(currentOrder);

  const menuItemMap = useMemo(() => {
    const entries = new Map();

    for (const item of todayMenu?.items || []) {
      const foodItemId = normalizeEntityId(item.foodItemId);

      if (foodItemId) {
        entries.set(foodItemId, item);
      }
    }

    return entries;
  }, [todayMenu?.items]);

  const reservedQuantityMap = useMemo(() => {
    const entries = new Map();

    if (!editingOrder) {
      return entries;
    }

    for (const item of currentOrder?.items || []) {
      const foodItemId = normalizeEntityId(item.foodItemId);

      if (foodItemId) {
        entries.set(foodItemId, Number(item.quantity || 0));
      }
    }

    return entries;
  }, [currentOrder?.items, editingOrder]);

  const cartQuantityMap = useMemo(() => {
    const entries = new Map();

    for (const item of cart.items) {
      entries.set(item.foodItemId, Number(item.quantity || 0));
    }

    return entries;
  }, [cart.items]);

  const fetchData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchTodayMenu()).unwrap(),
        dispatch(fetchCategories({ isActive: true, limit: 50 }))
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
    setOrderNotes(currentOrder?.notes || "");
  }, [currentOrder]);

  const filteredMenuItems = useMemo(() => {
    if (!todayMenu?.items) {
      return [];
    }

    let items = todayMenu.items;

    if (selectedCategoryId) {
      items = items.filter((item) => {
        const categoryId =
          item.foodItemId?.categoryId?._id || item.foodItemId?.categoryId;
        return categoryId === selectedCategoryId;
      });
    }

    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase();
      items = items.filter((item) =>
        item.foodItemId?.name?.toLowerCase().includes(normalizedQuery),
      );
    }

    return items;
  }, [todayMenu, selectedCategoryId, searchQuery]);

  const cartTotals = useMemo(() => {
    return buildCartPreviewTotals(cart.items);
  }, [cart.items]);

  const getItemSelectionMeta = useCallback(
    (foodItemId, currentCartQuantityOverride = null) => {
      const normalizedFoodItemId = normalizeEntityId(foodItemId);
      const menuItem = menuItemMap.get(normalizedFoodItemId);
      const reservedQuantity =
        reservedQuantityMap.get(normalizedFoodItemId) || 0;
      const currentCartQuantity =
        currentCartQuantityOverride ??
        cartQuantityMap.get(normalizedFoodItemId) ??
        0;
      const actualRemainingQuantity = Math.max(
        Number(menuItem?.remainingQuantity ?? 0),
        0,
      );
      const soldQuantity = Math.max(Number(menuItem?.soldQuantity ?? 0), 0);
      const preparedQuantity = Math.max(
        Number(menuItem?.preparedQuantity ?? 0),
        0,
      );
      const itemStatus = menuItem?.status ?? "Unavailable";
      const maxSelectableQuantity =
        reservedQuantity +
        (itemStatus === "Available" ? actualRemainingQuantity : 0);
      const canIncreaseQuantity =
        currentCartQuantity < reservedQuantity ||
        currentCartQuantity < maxSelectableQuantity;

      return {
        reservedQuantity,
        currentCartQuantity,
        actualRemainingQuantity,
        soldQuantity,
        preparedQuantity,
        itemStatus,
        maxSelectableQuantity,
        remainingSelectableQuantity: Math.max(
          maxSelectableQuantity - currentCartQuantity,
          0,
        ),
        canIncreaseQuantity,
      };
    },
    [cartQuantityMap, menuItemMap, reservedQuantityMap],
  );

  const cartItemsWithMeta = useMemo(
    () =>
      cart.items.map((item) => ({
        ...item,
        ...getItemSelectionMeta(item.foodItemId),
      })),
    [cart.items, getItemSelectionMeta],
  );

  const menuItemSelectionMap = useMemo(() => {
    const selectionMap = {};

    for (const item of todayMenu?.items || []) {
      const foodItemId = normalizeEntityId(item.foodItemId);

      if (foodItemId) {
        selectionMap[foodItemId] = getItemSelectionMeta(foodItemId);
      }
    }

    return selectionMap;
  }, [getItemSelectionMeta, todayMenu?.items]);

  const notifyQuantityLimit = useCallback(
    (foodItemName, maxSelectableQuantity) => {
      toast.warning(
        "Vuot qua so luong con lai",
        `Mon ${foodItemName} chi co the chon toi da ${maxSelectableQuantity} phan.`,
      );
    },
    [toast],
  );

  const handleAddItem = useCallback(
    (menuItem) => {
      const foodItem = menuItem?.foodItemId;
      const foodItemId = normalizeEntityId(foodItem);

      if (!foodItemId) {
        return false;
      }

      const liveCartQuantity =
        store
          .getState()
          .order.cart.items.find((entry) => entry.foodItemId === foodItemId)
          ?.quantity ?? 0;
      const selectionMeta = getItemSelectionMeta(foodItemId, liveCartQuantity);

      if (!selectionMeta.canIncreaseQuantity) {
        notifyQuantityLimit(
          foodItem?.name || "nay",
          selectionMeta.maxSelectableQuantity,
        );
        return false;
      }

      dispatch(
        addToCart({
          foodItemId,
          name: foodItem.name,
          unitPrice: menuItem.currentPrice,
          quantity: 1,
        }),
      );
      return true;
    },
    [dispatch, getItemSelectionMeta, notifyQuantityLimit, store],
  );

  const handleRemoveItem = useCallback(
    (foodItemId) => {
      dispatch(removeFromCart(foodItemId));
      return true;
    },
    [dispatch],
  );

  const handleUpdateQuantity = useCallback(
    (foodItemId, quantity) => {
      const liveCartQuantity =
        store
          .getState()
          .order.cart.items.find((entry) => entry.foodItemId === foodItemId)
          ?.quantity ?? 0;
      const selectionMeta = getItemSelectionMeta(foodItemId, liveCartQuantity);
      const nextQuantity = Number(quantity || 0);

      if (nextQuantity <= 0) {
        dispatch(updateCartItemQuantity({ foodItemId, quantity: 0 }));
        return true;
      }

      if (nextQuantity > selectionMeta.maxSelectableQuantity) {
        const itemName =
          cart.items.find((entry) => entry.foodItemId === foodItemId)?.name ||
          "nay";

        notifyQuantityLimit(itemName, selectionMeta.maxSelectableQuantity);
        dispatch(
          updateCartItemQuantity({
            foodItemId,
            quantity: selectionMeta.maxSelectableQuantity,
          }),
        );
        return false;
      }

      dispatch(updateCartItemQuantity({ foodItemId, quantity: nextQuantity }));
      return true;
    },
    [cart.items, dispatch, getItemSelectionMeta, notifyQuantityLimit, store],
  );

  const handleOrderNotesChange = useCallback((value) => {
    setOrderNotes(value);
  }, []);

  const handleUpdateItemNote = useCallback(
    (foodItemId, note) => {
      dispatch(updateCartItemNote({ foodItemId, note }));
      return true;
    },
    [dispatch],
  );

  const restoreEditableOrder = useCallback(
    (order) => {
      dispatch(startEditingOrder(order));
      setOrderNotes(order?.notes || "");
      return true;
    },
    [dispatch],
  );

  const handleClearCart = useCallback(() => {
    setOrderNotes("");
    dispatch(clearCart());
    return true;
  }, [dispatch]);

  const handleSubmitOrder = useCallback(async (options = {}) => {
    const { showSuccessToast = true } = options;

    if (cart.items.length === 0) {
      toast.error(
        editingOrder ? "Khong the cap nhat don" : "Khong the tao don",
        "Gio hang cua ban dang trong.",
      );
      return null;
    }

    const orderPayload = {
      items: cart.items.map((item) => ({
        foodItemId: item.foodItemId,
        quantity: item.quantity,
        note: item.note?.trim() || null,
      })),
      notes: orderNotes.trim() || null,
    };

    try {
      const result = editingOrder
        ? await dispatch(
            updateOrderItemsThunk({
              id: currentOrder._id,
              body: orderPayload,
            }),
          ).unwrap()
        : await dispatch(submitOrder(orderPayload)).unwrap();

      if (showSuccessToast) {
        toast.success(
          editingOrder ? "Cap nhat don thanh cong" : "Tao don thanh cong",
          editingOrder
            ? `Don hang #${result?.orderNumber ?? ""} da duoc cap nhat.`
            : `Don hang #${result?.orderNumber ?? ""} da duoc tao.`,
        );
      }

      dispatch(clearCart());
      setOrderNotes("");
      await fetchData();
      return result;
    } catch (error) {
      toast.error(
        editingOrder ? "Cap nhat don hang that bai" : "Tao don hang that bai",
        normalizeErrorMessage(error, "Da xay ra loi khi luu don."),
      );
      return null;
    }
  }, [cart.items, currentOrder?._id, dispatch, editingOrder, fetchData, orderNotes, toast]);

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
    cartItemsWithMeta,
    menuItemSelectionMap,
    cartTotals,
    orderNotes,
    handleOrderNotesChange,
    handleUpdateItemNote,
    handleAddItem,
    handleRemoveItem,
    handleUpdateQuantity,
    handleClearCart,
    handleSubmitOrder,
    restoreEditableOrder,
    submitStatus,
    submitError,
    currentOrder,
    isEditingOrder: editingOrder,
    refetchMenu: fetchData,
  };
};
