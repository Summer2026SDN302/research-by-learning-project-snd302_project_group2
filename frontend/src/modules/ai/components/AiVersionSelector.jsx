import dayjs from "dayjs";
import Spinner from "../../../components/feedback/Spinner";

/**
 * AiVersionSelector — Shared control bar shown at the top of each AI tab.
 * Renders a date picker, optional version dropdown, and a generate button.
 */
const AiVersionSelector = ({
  label,
  selectedDate,
  versions = [],
  insightVersion,
  buttonLabel,
  isLoading,
  isMutating,
  onDateChange,
  onVersionChange,
  onGenerate,
}) => (
  <div className="card flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-5 bg-surface-container-lowest border border-outline-variant rounded-xl">
    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
      {/* Date picker */}
      <div className="flex flex-col gap-1.5 w-full sm:w-auto">
        <label
          htmlFor="ai-insight-date"
          className="text-label-md text-on-surface-variant font-bold uppercase"
        >
          {label}
        </label>
        <input
          id="ai-insight-date"
          name="aiInsightDate"
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          disabled={isLoading || isMutating}
          className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-low focus:outline-none focus:border-primary text-body-md transition-colors"
        />
      </div>

      {/* Version selector — only shown when versions exist */}
      {versions.length > 0 && (
        <div className="flex flex-col gap-1.5 w-full sm:w-auto">
          <label
            htmlFor="ai-insight-version"
            className="text-label-md text-on-surface-variant font-bold uppercase"
          >
            Phiên bản chạy
          </label>
          <div className="relative">
            <select
              id="ai-insight-version"
              name="aiInsightVersion"
              value={insightVersion || ""}
              onChange={(e) => onVersionChange(e.target.value)}
              disabled={isLoading || isMutating}
              className="appearance-none pr-10 px-4 py-2 w-full rounded-lg border border-outline-variant bg-surface-container-low focus:outline-none focus:border-primary text-body-md transition-colors"
            >
              {versions.map((v) => (
                <option key={v.version} value={v.version}>
                  Bản V.0{v.version} ({dayjs(v.generatedAt).format("HH:mm - DD/MM/YYYY")})
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
      )}
    </div>

    {/* Generate button */}
    <button
      onClick={() => onGenerate(selectedDate)}
      disabled={isLoading || isMutating}
      className="btn-ai inline-flex items-center justify-center gap-2 self-end px-6 py-3 rounded-lg shadow-sm bg-primary text-on-primary hover:bg-primary-container transition-colors disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <Spinner size="sm" />
          Đang tính toán...
        </>
      ) : (
        <>
          <span className="material-symbols-outlined">auto_awesome</span>
          {buttonLabel}
        </>
      )}
    </button>
  </div>
);

export default AiVersionSelector;
