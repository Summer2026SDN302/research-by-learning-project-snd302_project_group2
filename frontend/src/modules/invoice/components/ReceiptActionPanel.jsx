import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * ReceiptActionPanel
 *
 * Props:
 *   role        {string}   - 'staff' | 'manager'
 *   onPrint     {Function} - Callback to trigger print count increase & window print
 *   invoiceId   {string}   - The invoice ID
 */
const ReceiptActionPanel = ({ role = "staff", onPrint, invoiceId }) => {
  const navigate = useNavigate();
  const isManager = role === "manager";

  return (
    <div className="flex flex-col gap-4 w-full select-none shrink-0">
      
      {/* Primary Action Button */}
      {!isManager ? (
        <button
          type="button"
          onClick={() => navigate("/staff/pos")}
          className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-md"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Tạo đơn mới
        </button>
      ) : (
        <button
          type="button"
          onClick={() => navigate("/manager/payments")}
          className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-md"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Quay lại thanh toán
        </button>
      )}

      {/* Secondary Action Grid */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
        <button
          type="button"
          onClick={onPrint}
          className="py-3.5 border-2 border-primary text-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/5 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined">print</span>
          In lại
        </button>
        <button
          type="button"
          onClick={() => navigate(isManager ? "/manager/dashboard" : "/staff/dashboard")}
          className="py-3.5 bg-surface-container-high text-on-surface rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-surface-container-highest active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined">dashboard</span>
          Dashboard
        </button>
      </div>
    </div>
  );
};

export default ReceiptActionPanel;
