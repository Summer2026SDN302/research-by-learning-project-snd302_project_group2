import { Component } from "react";

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Ứng dụng gặp lỗi khi render.",
    };
  }

  componentDidCatch(error, info) {
    // Giữ log ở console để debug, nhưng UI không bị trắng màn hoàn toàn.
    // eslint-disable-next-line no-console
    console.error("App render error:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-background p-6 text-on-surface">
        <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-error/30 bg-error-container/20 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3 text-error">
            <span className="material-symbols-outlined text-[32px]">error</span>
            <h1 className="text-headline-sm font-bold">Frontend render error</h1>
          </div>
          <p className="text-body-md text-on-surface-variant">
            App không còn trắng màn hoàn toàn. Mở DevTools Console để copy lỗi chi tiết.
          </p>
          {this.state.message && (
            <pre className="mt-4 overflow-auto rounded-lg bg-black/80 p-4 text-sm text-white">
              {this.state.message}
            </pre>
          )}
          <button
            type="button"
            className="mt-5 rounded-lg bg-primary px-4 py-2 text-on-primary"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
