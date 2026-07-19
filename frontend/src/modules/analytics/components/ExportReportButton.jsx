const ExportReportButton = ({ onClick, loading = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 shadow-sm transition-opacity disabled:opacity-60"
  >
    <span className="material-symbols-outlined">
      {loading ? "hourglass_empty" : "file_download"}
    </span>
    {loading ? "Đang xuất..." : "Xuất báo cáo"}
  </button>
);

export default ExportReportButton;
