import { useState } from "react";
import Spinner from "../../../components/feedback/Spinner";

const reportOptions = [
  { value: "All", label: "Tất cả đơn hàng", icon: "receipt_long" },
  { value: "Completed", label: "Đơn hàng đã hoàn thành", icon: "check_circle" },
  { value: "Cancelled", label: "Đơn hàng đã hủy", icon: "cancel" },
];

const ExportOrderModal = ({ open, onClose, onExport }) => {
  const [reportType, setReportType] = useState("All");
  const [isExporting, setIsExporting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedOption = reportOptions.find(opt => opt.value === reportType);

  if (!open) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(reportType);
      onClose();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={!isExporting ? onClose : undefined}
      ></div>

      {/* Dialog */}
      <div className="relative w-full max-w-md transform rounded-2xl bg-surface-container-lowest p-6 text-left align-middle shadow-xl transition-all">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20">
            <span className="material-symbols-outlined text-primary text-[24px]">
              download
            </span>
          </div>
          <div>
            <h3 className="font-title-lg text-on-surface">Xuất báo cáo đơn hàng</h3>
            <p className="mt-1 font-body-sm text-outline">
              Tải xuống file Excel báo cáo lịch sử đơn hàng
            </p>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <label className="mb-2 block font-label-md text-on-surface">
              Loại đơn hàng cần xuất
            </label>
            
            <button
              type="button"
              className="w-full flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3.5 font-body-md text-on-surface hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isExporting}
            >
              <div className="flex items-center gap-3">
                 <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container">
                   <span className="material-symbols-outlined text-[20px] text-primary">
                     {selectedOption?.icon}
                   </span>
                 </div>
                 <span className="font-medium">{selectedOption?.label}</span>
              </div>
              <span className={`material-symbols-outlined text-[20px] text-on-surface-variant transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDropdownOpen(false)}
                ></div>
                <div className="absolute top-full left-0 mt-2 w-full z-20 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {reportOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left font-body-md transition-colors ${
                         reportType === opt.value 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-on-surface hover:bg-surface-container-low hover:text-primary'
                      }`}
                      onClick={() => {
                        setReportType(opt.value);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${reportType === opt.value ? 'bg-primary/20' : 'bg-surface-container'}`}>
                        <span className={`material-symbols-outlined text-[20px] ${reportType === opt.value ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {opt.icon}
                        </span>
                      </div>
                      <span>{opt.label}</span>
                      {reportType === opt.value && (
                        <span className="material-symbols-outlined text-[20px] ml-auto text-primary">
                          check_circle
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="rounded-lg px-5 py-2.5 font-label-md text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
            onClick={onClose}
            disabled={isExporting}
          >
            Hủy
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center min-w-[120px] rounded-lg bg-primary px-5 py-2.5 font-label-md text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? <Spinner size="sm" color="text-on-primary" /> : "Tải xuống"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportOrderModal;
