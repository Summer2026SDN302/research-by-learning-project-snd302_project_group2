import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPaymentReceiptThunk,
  printPaymentReceiptThunk,
  resetPaymentReceiptState,
} from "../redux/paymentSlice";
import useAppToast from "@/hooks/useAppToast";

const getErrorMessage = (error, fallback = null) =>
  error?.message || error || fallback;

export const usePaymentReceipt = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  const receipt = useSelector((state) => state.payment.receipt);
  const status = useSelector((state) => state.payment.receiptStatus);
  const error = useSelector((state) => state.payment.receiptError);

  const fetchReceipt = useCallback(
    async (paymentId) => {
      try {
        await dispatch(fetchPaymentReceiptThunk(paymentId)).unwrap();
        return true;
      } catch {
        return null;
      }
    },
    [dispatch],
  );

  const handlePrint = useCallback(
    async (paymentId) => {
      try {
        window.print();
        await dispatch(printPaymentReceiptThunk(paymentId)).unwrap();
        toast.success(
          "In biên lai thành công",
          "Số lần in biên lai đã được cập nhật.",
        );
      } catch (err) {
        toast.error(
          "Lỗi khi ghi nhận in",
          getErrorMessage(err, "Không thể cập nhật số lần in biên lai."),
        );
      }
    },
    [dispatch, toast],
  );

  const resetState = useCallback(() => {
    dispatch(resetPaymentReceiptState());
  }, [dispatch]);

  return {
    receipt,
    loading: status === "loading",
    error: getErrorMessage(error, null),
    fetchReceipt,
    handlePrint,
    resetState,
  };
};
