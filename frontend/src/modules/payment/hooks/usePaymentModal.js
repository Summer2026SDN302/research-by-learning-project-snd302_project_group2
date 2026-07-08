import { useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  checkoutPaymentThunk,
  confirmPaymentThunk,
} from "../redux/paymentSlice";
import {
  DEFAULT_PAYMENT_METHOD,
  getDefaultPaymentProviderName,
} from "../constants/paymentConstants";
import useAppToast from "@/hooks/useAppToast";
import { getApiErrorMsg } from "@/utils/errorUtils";
import { PAYMENT_ERROR_MAP } from "../constants/paymentConstants";

const getOrderAmount = (order) =>
  Number(order?.finalAmount ?? order?.totalAmount ?? 0);

const normalizeText = (value) => {
  const normalized = String(value ?? "").trim();
  return normalized || null;
};

export const getQuickCashOptions = (amount) => {
  const totalAmount = Number(amount) || 0;

  if (totalAmount < 50000) {
    return [50000, 100000];
  }

  if (totalAmount < 100000) {
    return [100000, 200000];
  }

  const nextRoundedAmount = (Math.floor(totalAmount / 100000) + 1) * 100000;

  return [nextRoundedAmount, nextRoundedAmount + 100000];
};

export const usePaymentModal = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  const [isOpen, setIsOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [selectedMethod, setSelectedMethodState] = useState(
    DEFAULT_PAYMENT_METHOD,
  );
  const [cashReceived, setCashReceived] = useState("0");
  const [transactionCode, setTransactionCode] = useState("");
  const [providerName, setProviderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [confirmedPaymentData, setConfirmedPaymentData] = useState(null);

  const resetModalState = useCallback(() => {
    setIsOpen(false);
    setOrder(null);
    setSelectedMethodState(DEFAULT_PAYMENT_METHOD);
    setCashReceived("0");
    setTransactionCode("");
    setProviderName("");
    setIsSubmitting(false);
    setCheckoutUrl(null);
    setConfirmedPaymentData(null);
  }, []);

  const openModal = useCallback((orderData, initialMethod = "Cash") => {
    setOrder(orderData);
    setSelectedMethodState(initialMethod);
    setCashReceived("0");
    setTransactionCode("");
    setProviderName(getDefaultPaymentProviderName(initialMethod));
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    resetModalState();
  }, [resetModalState]);

  const handleSelectMethod = useCallback((method) => {
    setSelectedMethodState(method);
    setProviderName(getDefaultPaymentProviderName(method));
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

  const orderAmount = useMemo(() => getOrderAmount(order), [order]);

  const changeReturned = useMemo(() => {
    if (!order) return 0;
    const receivedVal = parseInt(cashReceived, 10) || 0;
    return receivedVal - orderAmount;
  }, [cashReceived, order, orderAmount]);

  const isCashValid = useMemo(() => {
    if (!order) return false;
    const receivedVal = parseInt(cashReceived, 10) || 0;
    return receivedVal >= orderAmount;
  }, [cashReceived, order, orderAmount]);

  const quickCashOptions = useMemo(
    () => getQuickCashOptions(orderAmount),
    [orderAmount],
  );

  const submitCheckout = useCallback(
    async (onSuccess) => {
      if (!order) {
        return null;
      }

      setIsSubmitting(true);

      const amountVal =
        selectedMethod === "Cash"
          ? parseInt(cashReceived, 10) || 0
          : orderAmount;

      if (selectedMethod === "Cash" && amountVal < orderAmount) {
        toast.error("Thanh toán thất bại", "Số tiền khách đưa chưa đủ.");
        setIsSubmitting(false);
        return null;
      }

      const normalizedTransactionCode =
        selectedMethod === "Cash" ? null : normalizeText(transactionCode);

      let confirmedPayment;

      try {
        confirmedPayment = await dispatch(
          checkoutPaymentThunk({
            orderId: order._id,
            paymentMethod: selectedMethod,
            amountReceived: amountVal,
            transactionCode: normalizedTransactionCode,
          }),
        ).unwrap();

        const orderNumber =
          confirmedPayment?.orderId?.orderNumber || order?.orderNumber || null;

        if (confirmedPayment?.checkoutUrl) {
          setCheckoutUrl(confirmedPayment.checkoutUrl);
          setConfirmedPaymentData(confirmedPayment);
          setIsSubmitting(false);
          toast.info(
            "Đã tạo liên kết thanh toán PayOS",
            "Vui lòng quét mã QR.",
          );
          return confirmedPayment;
        } else {
          toast.success(
            "Thanh toán thành công",
            orderNumber
              ? `Đơn hàng #${orderNumber} đã thanh toán xong và được lưu biên lai.`
              : "Giao dịch đã thanh toán xong và được lưu biên lai.",
          );
        }
      } catch (err) {
        toast.error(
          "Giao dịch thất bại",
          getApiErrorMsg(PAYMENT_ERROR_MAP, err),
        );
        setIsSubmitting(false);
        return null;
      }

      try {
        if (onSuccess) {
          await onSuccess(confirmedPayment);
        }
      } catch (callbackError) {
        console.error("Checkout success callback failed", callbackError);
      } finally {
        resetModalState();
      }

      return confirmedPayment;
    },
    [
      cashReceived,
      dispatch,
      order,
      orderAmount,
      resetModalState,
      selectedMethod,
      toast,
      transactionCode,
    ],
  );

  const confirmPaymentOffline = useCallback(
    async (paymentId, transactionCode) => {
      setIsSubmitting(true);
      try {
        const confirmed = await dispatch(
          confirmPaymentThunk({ paymentId, transactionCode }),
        ).unwrap();
        toast.success(
          "Thanh toán thành công",
          "Giao dịch đã được xác nhận ngoại tuyến thành công.",
        );
        resetModalState();
        return confirmed;
      } catch (err) {
        toast.error(
          "Xác nhận thất bại",
          getApiErrorMsg(PAYMENT_ERROR_MAP, err),
        );
        setIsSubmitting(false);
        return null;
      }
    },
    [dispatch, toast, resetModalState],
  );

  return {
    isOpen,
    order,
    selectedMethod,
    setSelectedMethod: handleSelectMethod,
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
    quickCashOptions,
    submitCheckout,
    confirmPaymentOffline,
    checkoutUrl,
    confirmedPaymentData,
    resetModalState,
  };
};
