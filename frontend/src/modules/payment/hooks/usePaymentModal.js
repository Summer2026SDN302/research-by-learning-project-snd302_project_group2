import { useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { initiatePaymentThunk, confirmPaymentThunk } from "../redux/paymentSlice";
import useAppToast from "@/hooks/useAppToast";
import { getApiErrorMsg } from "@/utils/errorUtils";
import { PAYMENT_ERROR_MAP } from "../constants/paymentConstants";

export const usePaymentModal = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  const [isOpen, setIsOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("Cash");
  const [cashReceived, setCashReceived] = useState("0");
  const [transactionCode, setTransactionCode] = useState("");
  const [providerName, setProviderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = useCallback((orderData, initialMethod = "Cash") => {
    setOrder(orderData);
    setSelectedMethod(initialMethod);
    setCashReceived("0");
    setTransactionCode("");
    setProviderName("");
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setOrder(null);
  }, []);

  const appendDigit = useCallback((digit) => {
    setCashReceived((prev) => {
      if (digit === ".000") {
        if (prev === "0" || prev === "") return "0";
        return prev + "000";
      }
      if (prev === "0") return digit;
      return prev + digit;
    });
  }, []);

  const clearCash = useCallback(() => {
    setCashReceived("0");
  }, []);

  const setCashReceivedAmount = useCallback((amount) => {
    setCashReceived(String(amount));
  }, []);

  const changeReturned = useMemo(() => {
    if (!order) return 0;
    const receivedVal = parseInt(cashReceived, 10) || 0;
    return receivedVal - order.finalAmount;
  }, [cashReceived, order]);

  const isCashValid = useMemo(() => {
    if (!order) return false;
    const receivedVal = parseInt(cashReceived, 10) || 0;
    return receivedVal >= order.finalAmount;
  }, [cashReceived, order]);

  const submitCheckout = useCallback(
    async (onSuccess) => {
      if (!order) return;
      setIsSubmitting(true);

      const amountVal =
        selectedMethod === "Cash"
          ? (parseInt(cashReceived, 10) || 0)
          : order.finalAmount;

      if (selectedMethod === "Cash" && amountVal < order.finalAmount) {
        toast.error("Thanh toán thất bại", "Số tiền khách đưa chưa đủ.");
        setIsSubmitting(false);
        return;
      }

      try {
        const initiatePayload = {
          orderId: order._id,
          paymentMethod: selectedMethod,
          amountReceived: amountVal,
          providerName:
            selectedMethod !== "Cash" ? (providerName || selectedMethod) : null,
          transactionCode:
            selectedMethod !== "Cash" ? (transactionCode || null) : null,
        };

        const paymentResult = await dispatch(
          initiatePaymentThunk(initiatePayload),
        ).unwrap();

        const confirmPayload = {
          id: paymentResult._id,
          confirmData: {
            amountReceived: amountVal,
            providerName:
              selectedMethod !== "Cash" ? (providerName || selectedMethod) : null,
            transactionCode:
              selectedMethod !== "Cash" ? (transactionCode || null) : null,
          },
        };

        const confirmedPayment = await dispatch(
          confirmPaymentThunk(confirmPayload),
        ).unwrap();

        toast.success(
          "Thanh toán thành công",
          `Đơn hàng #${order.orderNumber} đã thanh toán xong và được lưu hóa đơn.`,
        );
        closeModal();

        if (onSuccess) {
          onSuccess(confirmedPayment);
        }
      } catch (err) {
        const errMsg = getApiErrorMsg(PAYMENT_ERROR_MAP, err);
        toast.error("Giao dịch thất bại", errMsg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      order,
      selectedMethod,
      cashReceived,
      providerName,
      transactionCode,
      dispatch,
      toast,
      closeModal,
    ],
  );

  return {
    isOpen,
    order,
    selectedMethod,
    setSelectedMethod,
    cashReceived,
    transactionCode,
    setTransactionCode,
    providerName,
    setProviderName,
    isSubmitting,
    openModal,
    closeModal,
    appendDigit,
    clearCash,
    setCashReceivedAmount,
    changeReturned,
    isCashValid,
    submitCheckout,
  };
};
