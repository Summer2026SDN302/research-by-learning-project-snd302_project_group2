import { useEffect } from "react";
import { useParams } from "react-router-dom";
import ReceiptPageContent from "../components/ReceiptPageContent";
import { usePaymentReceipt } from "@/modules/payment/hooks/usePaymentReceipt";

/**
 * ReceiptPage — trang biên lai dùng chung cho tất cả roles.
 * Props:
 *   role {string} - "staff" | "manager" | "admin"
 */
const ReceiptPage = ({ role }) => {
  const { paymentId } = useParams();
  const { receipt, loading, error, fetchReceipt, handlePrint, resetState } =
    usePaymentReceipt();

  useEffect(() => {
    void fetchReceipt(paymentId);
    return () => {
      resetState();
    };
  }, [fetchReceipt, paymentId, resetState]);

  // Confetti chỉ hiện cho staff sau khi thanh toán thành công
  useEffect(() => {
    if (role !== "staff" || loading || error || !receipt) {
      return undefined;
    }

    const container = document.getElementById("confetti-container");
    if (!container) {
      return undefined;
    }

    const colors = ["#00685f", "#4edea3", "#6bd8cb", "#006c49", "#ffb59a"];
    const elements = [];

    for (let index = 0; index < 60; index += 1) {
      const confetti = document.createElement("div");
      confetti.style.position = "absolute";
      confetti.style.width = `${Math.random() * 8 + 6}px`;
      confetti.style.height = `${Math.random() * 8 + 6}px`;
      confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.top = "-20px";
      confetti.style.opacity = Math.random().toString();
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      confetti.style.animation = `fall ${Math.random() * 3 + 2.5}s linear ${
        Math.random() * 1.5
      }s forwards`;

      container.appendChild(confetti);
      elements.push(confetti);
    }

    return () => {
      elements.forEach((element) => element.remove());
    };
  }, [role, error, loading, receipt]);

  return (
    <ReceiptPageContent
      role={role}
      receipt={receipt}
      loading={loading}
      error={error}
      onPrint={() => handlePrint(paymentId)}
    />
  );
};

export default ReceiptPage;
