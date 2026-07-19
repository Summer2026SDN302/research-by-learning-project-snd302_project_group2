import { useSelector } from "react-redux";

/**
 * Hook to encapsulate AI insight permissions logic.
 */
const useAiPermissions = (isAdmin) => {
  const currentUser = useSelector((state) => state.auth.user);

  /**
   * Determine if the current user can override or apply the insight.
   * @param {Object} item The forecast or pricing recommendation item
   * @returns {boolean}
   */
  const canOverrideItem = (item) => {
    if (!item) return false;
    
    // Anyone can apply pending items
    if (item.status === "Pending") {
      return true;
    }
    
    // Only admins can override finalized items
    if (!isAdmin) {
      return false;
    }

    const finalizedBy = item.appliedBy || item.rejectedBy;
    if (!finalizedBy) {
      return true;
    }

    // Admins cannot override their own decisions
    if (finalizedBy._id === currentUser?._id) {
      return false;
    }

    // Admins can only override Manager decisions
    if (finalizedBy.role !== "Manager") {
      return false;
    }

    return true;
  };

  return { canOverrideItem };
};

export default useAiPermissions;
