import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderByIdThunk, clearOrderDetail } from "../redux/orderSlice";

/**
 * Hook for order detail details
 * Fetches order info when modal is open and orderId changes
 */
export const useOrderDetail = (orderId, open) => {
  const dispatch = useDispatch();

  const order = useSelector((state) => state.order.orderDetail);
  const orderDetailStatus = useSelector((state) => state.order.orderDetailStatus);
  const orderDetailError = useSelector((state) => state.order.orderDetailError);

  const loading = orderDetailStatus === "loading";
  const error = orderDetailError ? (orderDetailError.message || orderDetailError) : null;

  useEffect(() => {
    if (orderId && open) {
      void dispatch(fetchOrderByIdThunk(orderId));
    }
    return () => {
      dispatch(clearOrderDetail());
    };
  }, [orderId, open, dispatch]);

  return {
    order,
    loading,
    error,
  };
};
