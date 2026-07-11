import { useState, useMemo } from "react";
import useAiInsight from "./useAiInsight";

/**
 * useAiPricing
 *
 * Hook for managing the AI Pricing Tab component state and handlers.
 */
const useAiPricing = () => {
  const { insight, applyPricing } = useAiInsight();
  const [selectedItem, setSelectedItem] = useState(null);

  // ── Derived State ──────────────────────────────────────────────────────────
  const pricingRecommendations = useMemo(() => insight?.pricingRecommendations || [], [insight]);

  const decisionStats = useMemo(() => {
    const total = pricingRecommendations.length;
    if (total === 0) return null;

    let pending = 0, applied = 0, rejected = 0;
    pricingRecommendations.forEach(p => {
      if (p.status === "Pending") pending++;
      else if (p.status === "Applied") applied++;
      else if (p.status === "Rejected") rejected++;
    });

    const finalized = applied + rejected;
    const progressPercent = Math.round((finalized / total) * 100);

    return { total, pending, applied, rejected, finalized, progressPercent };
  }, [pricingRecommendations]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleApplySingle = (foodItemId) => {
    applyPricing(insight._id, [{ foodItemId, status: "Applied" }]);
    if (selectedItem?.foodItemId === foodItemId) {
      setSelectedItem((prev) => ({ ...prev, status: "Applied" }));
    }
  };

  const handleRejectSingle = (foodItemId) => {
    applyPricing(insight._id, [{ foodItemId, status: "Rejected" }]);
    if (selectedItem?.foodItemId === foodItemId) {
      setSelectedItem((prev) => ({ ...prev, status: "Rejected" }));
    }
  };

  const handleApplyAll = () => {
    if (!insight?._id) return;
    const pendingUpdates = pricingRecommendations
      .filter((p) => p.status === "Pending")
      .map((p) => ({ foodItemId: p.foodItemId, status: "Applied" }));
    if (pendingUpdates.length > 0) {
      applyPricing(insight._id, pendingUpdates);
    }
  };

  return {
    pricingRecommendations,
    decisionStats,
    selectedItem,
    setSelectedItem,
    handleApplySingle,
    handleRejectSingle,
    handleApplyAll,
  };
};

export default useAiPricing;
