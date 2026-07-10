import { useEffect } from "react";

const PaymentSuccessPage = () => {
  useEffect(() => {
    window.parent.postMessage({ type: "PAYMENT_SUCCESS" }, "*");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-100 shadow-xl flex flex-col items-center">
        {/* Animated Checkmark Circle */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[44px] text-emerald-500">
            check_circle
          </span>
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Thanh toán thành công!
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Giao dịch đã được ghi nhận trên hệ thống. Cửa hàng đang tiến hành
          chuẩn bị đơn cho bạn.
        </p>

        <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100/60 mb-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Trạng thái</span>
            <span>Mã</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
              Đã thanh toán
            </span>
            <span className="font-mono text-sm font-bold text-slate-700">
              #SUCCESS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
