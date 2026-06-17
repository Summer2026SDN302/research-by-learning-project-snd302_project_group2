import { useState } from "react";
import { createPortal } from "react-dom";
import Spinner from "../../../../components/feedback/Spinner";
import dayjs from "dayjs";
import { generateMenuSchema } from "../../validation/daily-menu/dailyMenuSchema";

/**
 * GenerateMenuModal
 *
 * Props:
 *   open       {boolean}
 *   onGenerate {fn}        – (date: string) => void
 *   onClose    {fn}
 *   isLoading  {boolean}
 *   defaultDate {string}
 */
const GenerateMenuModal = ({
  open,
  onGenerate,
  onClose,
  isLoading,
  defaultDate,
}) => {
  const getInitialDate = () => {
    if (defaultDate && !dayjs(defaultDate).isBefore(dayjs().startOf("day"))) {
      return defaultDate;
    }
    return dayjs().format("YYYY-MM-DD");
  };

  const [date, setDate] = useState(getInitialDate);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = generateMenuSchema.safeParse({ date });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Ngày không hợp lệ");
      return;
    }
    if (dayjs(date).isBefore(dayjs().startOf("day"))) {
      setError("Không thể chọn ngày trong quá khứ");
      return;
    }

    setError("");
    onGenerate(date);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Dialog */}
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-elevated p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-5 mx-auto">
          <span className="material-symbols-outlined text-[32px]">
            auto_awesome
          </span>
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h3 className="text-headline-sm font-bold text-on-surface">
            Tạo thực đơn ngày
          </h3>
          <p className="text-body-sm text-on-surface-variant mt-2">
            Tạo thực đơn ngày từ thực đơn theo lịch.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              Chọn ngày
            </label>
            <input
              type="date"
              value={date}
              min={dayjs().format("YYYY-MM-DD")}
              onChange={(e) => {
                setDate(e.target.value);
                setError("");
              }}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-4 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
            />
            {error && <p className="text-[11px] text-error mt-1">{error}</p>}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl border border-outline-variant text-body-sm font-semibold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-body-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Spinner size="sm" />}
              Tạo
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default GenerateMenuModal;
