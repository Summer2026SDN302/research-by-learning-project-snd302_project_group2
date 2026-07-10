import dayjs from "dayjs";

/**
 * AiDecisionStats — Sidebar card displaying decision status, progress bar and advice.
 */
const AiDecisionStats = ({ decisionStats, selectedDate }) => {
  const { total = 0, pending = 0, applied = 0, rejected = 0, finalized = 0, progressPercent = 0 } = decisionStats || {};

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-5">
      <h3 className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">analytics</span>
        Phân tích quyết định
      </h3>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-body-sm font-semibold">
          <span className="text-on-surface-variant">Tiến trình phê duyệt</span>
          <span className="text-primary">{progressPercent}% ({finalized}/{total})</span>
        </div>
        <div className="w-full bg-surface-container-low h-3 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Details list */}
      <div className="grid grid-cols-3 gap-2 text-center pt-2">
        <div className="bg-warning-container/30 border border-warning/20 p-3 rounded-lg">
          <div className="text-headline-sm font-bold text-warning">{pending}</div>
          <div className="text-label-sm text-warning/80 font-semibold mt-0.5">Chờ duyệt</div>
        </div>
        <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg">
          <div className="text-headline-sm font-bold text-primary">{applied}</div>
          <div className="text-label-sm text-primary/80 font-semibold mt-0.5">Đã áp dụng</div>
        </div>
        <div className="bg-error-container/30 border border-error/20 p-3 rounded-lg">
          <div className="text-headline-sm font-bold text-error">{rejected}</div>
          <div className="text-label-sm text-error/80 font-semibold mt-0.5">Từ chối</div>
        </div>
      </div>

      {/* Smart insight note */}
      <div className="bg-primary-container/20 border border-primary/10 p-4 rounded-xl flex items-start gap-2.5">
        <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
          lightbulb
        </span>
        <div className="text-body-sm text-on-surface-variant">
          {pending > 0 ? (
            <p>
              Hệ thống đang có <strong className="text-primary">{pending} đề xuất cần duyệt</strong> cho ngày <strong>{dayjs(selectedDate).format("DD/MM/YYYY")}</strong>. Hãy xem xét để tối ưu hóa quyết định kinh doanh.
            </p>
          ) : (
            <p>
              Tất cả các đề xuất cho ngày <strong>{dayjs(selectedDate).format("DD/MM/YYYY")}</strong> đã được quyết định xong.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiDecisionStats;
