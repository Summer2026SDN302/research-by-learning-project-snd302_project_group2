import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import ReceiptPageContent from "../components/ReceiptPageContent";
import { usePaymentReceipt } from "@/modules/payment/hooks/usePaymentReceipt";

const AdminReceiptPage = () => {
  const { paymentId } = useParams();
  const { receipt, loading, error, fetchReceipt, handlePrint, resetState } =
    usePaymentReceipt();

  useEffect(() => {
    void fetchReceipt(paymentId);

    return () => {
      resetState();
    };
  }, [fetchReceipt, paymentId, resetState]);

  return (
    <ReceiptPageContent
      role="admin"
      receipt={receipt}
      loading={loading}
      error={error}
      onPrint={() => handlePrint(paymentId)}
    />
  );
};

export default AdminReceiptPage;
