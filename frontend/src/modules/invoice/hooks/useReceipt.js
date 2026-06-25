import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReceiptThunk, printReceiptThunk, resetInvoiceState } from "../redux/invoiceSlice";
import useAppToast from "@/hooks/useAppToast";

export const useReceipt = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  const receipt = useSelector((state) => state.invoice.receipt);
  const status = useSelector((state) => state.invoice.status);
  const error = useSelector((state) => state.invoice.error);

  const fetchReceipt = useCallback(
    (invoiceId) => {
      dispatch(fetchReceiptThunk(invoiceId));
    },
    [dispatch]
  );

  const handlePrint = useCallback(
    async (invoiceId) => {
      try {
        // Trigger browser printing window
        window.print();

        // Notify backend to increment print count
        await dispatch(printReceiptThunk(invoiceId)).unwrap();
        toast.success("In biên lai thành công", "Số lần in biên lai đã được cập nhật.");
      } catch (err) {
        toast.error("Lỗi khi ghi nhận in", err?.message || "Không thể cập nhật số lần in hóa đơn.");
      }
    },
    [dispatch, toast]
  );

  const resetState = useCallback(() => {
    dispatch(resetInvoiceState());
  }, [dispatch]);

  return {
    receipt,
    loading: status === "loading",
    error,
    fetchReceipt,
    handlePrint,
    resetState,
  };
};
