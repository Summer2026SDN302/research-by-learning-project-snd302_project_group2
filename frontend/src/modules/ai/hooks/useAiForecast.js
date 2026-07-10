import { useState, useMemo } from "react";
import useAiInsight from "./useAiInsight";

/**
 * useAiForecast
 *
 * Hook for managing the AI Forecast Tab component state and derived data.
 */
const useAiForecast = () => {
  const { insight, applyForecast } = useAiInsight();
  const [selectedItem, setSelectedItem] = useState(null);

  // ── Derived State ──────────────────────────────────────────────────────────
  const forecasts = useMemo(() => insight?.forecasts || [], [insight]);

  const totalPredicted = useMemo(() => {
    return forecasts.reduce((sum, f) => sum + f.predictedDemand, 0);
  }, [forecasts]);

  const totalRecommended = useMemo(() => {
    return forecasts.reduce((sum, f) => sum + f.recommendedQuantity, 0);
  }, [forecasts]);

  const topDish = useMemo(() => {
    if (forecasts.length === 0) {
      return null;
    }
    return forecasts.reduce(
      (max, f) => (f.predictedDemand > max.predictedDemand ? f : max),
      forecasts[0]
    );
  }, [forecasts]);

  const decisionStats = useMemo(() => {
    const total = forecasts.length;
    const pending = forecasts.filter((f) => f.status === "Pending").length;
    const applied = forecasts.filter((f) => f.status === "Applied").length;
    const rejected = forecasts.filter((f) => f.status === "Rejected").length;
    const finalized = applied + rejected;
    const progressPercent = total > 0 ? Math.round((finalized / total) * 100) : 0;
    return { total, pending, applied, rejected, finalized, progressPercent };
  }, [forecasts]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleApplySingle = (foodItemId) => {
    applyForecast(insight._id, [{ foodItemId, status: "Applied" }]);
    if (selectedItem?.foodItemId === foodItemId) {
      setSelectedItem((prev) => ({ ...prev, status: "Applied" }));
    }
  };

  const handleRejectSingle = (foodItemId) => {
    applyForecast(insight._id, [{ foodItemId, status: "Rejected" }]);
    if (selectedItem?.foodItemId === foodItemId) {
      setSelectedItem((prev) => ({ ...prev, status: "Rejected" }));
    }
  };

  const handleApplyAll = () => {
    if (!insight?._id) return;
    const pendingUpdates = forecasts
      .filter((f) => f.status === "Pending")
      .map((f) => ({ foodItemId: f.foodItemId, status: "Applied" }));
    if (pendingUpdates.length > 0) {
      applyForecast(insight._id, pendingUpdates);
    }
  };

  return {
    forecasts,
    totalPredicted,
    totalRecommended,
    topDish,
    decisionStats,
    selectedItem,
    setSelectedItem,
    handleApplySingle,
    handleRejectSingle,
    handleApplyAll,
  };
};

export default useAiForecast;
