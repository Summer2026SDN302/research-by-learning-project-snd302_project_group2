import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPaymentReceiptThunk,
  printPaymentReceiptThunk,
  resetPaymentReceiptState,
} from "../redux/paymentSlice";
import useAppToast from "@/hooks/useAppToast";
import { getApiErrorMsg } from "@/utils/errorUtils";
import { PAYMENT_RECEIPT_ERROR_MAP } from "../constants/paymentConstants";

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
      } catch (err) {
        toast.error(
          "Không thể tải biên lai",
          getApiErrorMsg(
            PAYMENT_RECEIPT_ERROR_MAP,
            err,
            "Không thể tải thông tin biên lai thanh toán.",
          ),
        );
        return null;
      }
    },
    [dispatch, toast],
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
          getApiErrorMsg(
            PAYMENT_RECEIPT_ERROR_MAP,
            err,
            "Không thể cập nhật số lần in biên lai.",
          ),
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
    error: error?.message || error || null,
    fetchReceipt,
    handlePrint,
    resetState,
  };
};
