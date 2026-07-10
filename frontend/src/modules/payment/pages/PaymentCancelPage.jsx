const PaymentCancelPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-100 shadow-xl flex flex-col items-center">
        {/* Animated Warning Circle */}
        <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[44px] text-rose-500">
            cancel
          </span>
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Giao dịch đã huỷ!
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Yêu cầu thanh toán đã bị huỷ bởi người dùng. Bạn có thể thử thanh toán
          lại hoặc chọn hình thức khác.
        </p>

        <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100/60 mb-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Trạng thái</span>
            <span>Mã</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
              Đã huỷ
            </span>
            <span className="font-mono text-sm font-bold text-slate-700">
              #CANCELLED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
