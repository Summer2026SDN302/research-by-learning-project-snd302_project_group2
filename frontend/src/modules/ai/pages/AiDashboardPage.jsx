import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import PageHeader from "../../../components/layout/PageHeader";
import useAiInsight from "../hooks/useAiInsight";
import AiForecastTab from "../components/AiForecastTab";
import AiPricingTab from "../components/AiPricingTab";
import AiDemandTab from "../components/AiDemandTab";

const AiDashboardPage = () => {
  const location = useLocation();
  const {
    insight,
    isLoading,
    isMutating,
    error,
    selectedDate,
    activeTab,
    versions,
    fetchInsight,
    changeSelectedDate,
    changeActiveTab,
    resetState,
    generateDailyInsight,
    generatePricing,
  } = useAiInsight();

  // Dynamic breadcrumbs based on the current URL role prefix
  const isAdmin = location.pathname.startsWith("/admin");
  const roleLabel = isAdmin ? "Admin" : "Manager";

  // Date and version resetting logic based on active tab
  const handleTabChange = (tab) => {
    changeActiveTab(tab);
    const today = dayjs().format("YYYY-MM-DD");
    if (selectedDate === today) {
      // If date is already today, state won't change, so useEffect won't trigger.
      // We manually fetch to clear any selected version and get the latest.
      fetchInsight(today);
    } else {
      changeSelectedDate(today);
    }
  };

  const handleVersionChange = (version) => {
    fetchInsight(selectedDate, version);
  };

  // Initialize dates correctly to today on initial load
  useEffect(() => {
    changeSelectedDate(dayjs().format("YYYY-MM-DD"));
    
    return () => {
      resetState();
    };
  }, [changeSelectedDate, resetState]);

  return (
    <div className="relative min-h-[500px] space-y-6">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={[{ label: roleLabel }, { label: "Tối ưu hóa AI" }]}
        title="Tối ưu hóa & Dự báo AI"
        subtitle="Hệ thống hỗ trợ ra quyết định chuẩn bị thực đơn và định giá xả kho tự động tích hợp Machine Learning."
      />

      {/* Global Error message */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-error/30 bg-error-container/20 text-error text-body-sm animate-shake">
          <span className="material-symbols-outlined text-[20px] shrink-0 font-bold">
            error
          </span>
          <div>
            <p className="font-semibold text-headline-sm leading-tight">Lỗi hệ thống AI</p>
            <p className="mt-1 opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Tab Segment Controls */}
      <div className="flex border-b border-outline-variant/60 overflow-x-auto">
        <button
          onClick={() => handleTabChange("overview")}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-body-md border-b-2 transition-all duration-150 whitespace-nowrap ${
            activeTab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            insights
          </span>
          Tổng quan nhu cầu
        </button>
        <button
          onClick={() => handleTabChange("forecast")}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-body-md border-b-2 transition-all duration-150 whitespace-nowrap ${
            activeTab === "forecast"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            query_stats
          </span>
          Dự báo chuẩn bị
        </button>
        <button
          onClick={() => handleTabChange("pricing")}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-body-md border-b-2 transition-all duration-150 whitespace-nowrap ${
            activeTab === "pricing"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            price_change
          </span>
          Định giá xả kho
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="pt-2">
        {activeTab === "overview" && (
          <AiDemandTab
            insight={insight}
            isLoading={isLoading}
            isMutating={isMutating}
            selectedDate={selectedDate}
            versions={versions}
            onVersionChange={handleVersionChange}
            onDateChange={changeSelectedDate}
            onGenerate={generateDailyInsight}
          />
        )}
        {activeTab === "forecast" && (
          <AiForecastTab
            insight={insight}
            isLoading={isLoading}
            isMutating={isMutating}
            selectedDate={selectedDate}
            versions={versions}
            isAdmin={isAdmin}
            onVersionChange={handleVersionChange}
            onDateChange={changeSelectedDate}
            onGenerate={generateDailyInsight}
          />
        )}
        {activeTab === "pricing" && (
          <AiPricingTab
            insight={insight}
            isLoading={isLoading}
            isMutating={isMutating}
            selectedDate={selectedDate}
            versions={versions}
            isAdmin={isAdmin}
            onVersionChange={handleVersionChange}
            onDateChange={changeSelectedDate}
            onGenerate={generatePricing}
          />
        )}
      </div>
    </div>
  );
};

export default AiDashboardPage;

