import React from "react";
import { useNavigate } from "react-router-dom";

const ROLE_CONFIG = {
  staff: {
    primaryPath: "/staff/pos",
    primaryLabel: "Tao don moi",
    primaryIcon: "add_circle",
    dashboardPath: "/staff/dashboard",
  },
  manager: {
    primaryPath: "/manager/payments",
    primaryLabel: "Quay lai thanh toan",
    primaryIcon: "arrow_back",
    dashboardPath: "/manager/dashboard",
  },
  admin: {
    primaryPath: "/admin/payments",
    primaryLabel: "Quay lai thanh toan",
    primaryIcon: "arrow_back",
    dashboardPath: "/admin/dashboard",
  },
};

const ReceiptActionPanel = ({ role = "staff", onPrint }) => {
  const navigate = useNavigate();
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.staff;

  return (
    <div className="flex w-full shrink-0 flex-col gap-4 select-none">
      <button
        type="button"
        onClick={() => navigate(config.primaryPath)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-bold text-on-primary shadow-md transition-all hover:opacity-95 active:scale-[0.98]"
      >
        <span className="material-symbols-outlined">{config.primaryIcon}</span>
        {config.primaryLabel}
      </button>

      <div className="grid shrink-0 grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onPrint}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary py-3.5 font-bold text-primary transition-all hover:bg-primary/5 active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">print</span>
          In lai
        </button>
        <button
          type="button"
          onClick={() => navigate(config.dashboardPath)}
          className="flex items-center justify-center gap-2 rounded-xl bg-surface-container-high py-3.5 font-bold text-on-surface transition-all hover:bg-surface-container-highest active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">dashboard</span>
          Dashboard
        </button>
      </div>
    </div>
  );
};

export default ReceiptActionPanel;
