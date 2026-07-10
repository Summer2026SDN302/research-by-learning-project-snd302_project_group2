import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as aiApi from "../api/aiApi";
import {
  setInsight,
  clearInsight,
  setLoading,
  setMutating,
  setError,
  setSelectedDate,
  setActiveTab,
  setVersions,
  resetAiState,
  selectAiInsight,
  selectAiLoading,
  selectAiMutating,
  selectAiError,
  selectAiSelectedDate,
  selectActiveTab,
  selectAiVersions,
} from "../redux/aiSlice";
import useAppToast from "../../../hooks/useAppToast";
import { getApiErrorMsg } from "../../../utils/errorUtils";
import { AI_ERROR_MAP } from "../constants/aiConstants";

/**
 * useAiInsight
 *
 * Hook for managing AI Forecasts and Dynamic Pricing recommendations.
 */
const useAiInsight = () => {
  const dispatch = useDispatch();
  const { toast } = useAppToast();

  // ── Selectors ──────────────────────────────────────────────────────────────
  const insight = useSelector(selectAiInsight);
  const isLoading = useSelector(selectAiLoading);
  const isMutating = useSelector(selectAiMutating);
  const error = useSelector(selectAiError);
  const selectedDate = useSelector(selectAiSelectedDate);
  const activeTab = useSelector(selectActiveTab);
  const versions = useSelector(selectAiVersions);

  // ── Fetching / API Operations ──────────────────────────────────────────────

  // Fetch Insight data for a specific date & optional version
  const fetchInsight = useCallback(
    async (date, version) => {
      dispatch(setLoading(true));
      dispatch(clearInsight());
      try {
        const data = await aiApi.getInsightByDate(date, version);
        dispatch(setInsight(data));
      } catch (err) {
        const status = err?.response?.status;
        const msg = getApiErrorMsg(
          AI_ERROR_MAP,
          err,
          "Không thể tải dữ liệu phân tích AI.",
        );

        // If not found, it is not a hard error, just means no insights generated yet
        if (status === 404) {
          dispatch(setInsight(null));
        } else {
          dispatch(setError(msg));
        }
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch],
  );

  // Fetch all versions for a target date
  const fetchVersions = useCallback(
    async (date) => {
      dispatch(setVersions([]));
      try {
        const data = await aiApi.getInsightVersions(date);
        dispatch(setVersions(data || []));
      } catch {
        dispatch(setVersions([]));
      }
    },
    [dispatch],
  );

  // Generate forecasting insights
  const generateDailyInsight = useCallback(
    async (date) => {
      dispatch(setLoading(true));
      try {
        const data = await aiApi.generateInsight(date);
        dispatch(setInsight(data));
        toast.success(
          "Thành công",
          "Đã khởi tạo dự đoán nhu cầu AI thành công.",
        );
      } catch (err) {
        const msg = getApiErrorMsg(
          AI_ERROR_MAP,
          err,
          "Không thể tạo dự đoán nhu cầu AI.",
        );
        toast.error("Lỗi", msg);
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, toast],
  );

  // Apply forecasts menu quantities
  const applyForecast = useCallback(
    async (insightId, updates) => {
      dispatch(setMutating(true));
      try {
        const data = await aiApi.applyForecasts(insightId, updates);
        dispatch(setInsight(data));
        toast.success(
          "Thành công",
          "Đã cập nhật thực đơn theo đề xuất dự báo.",
        );
      } catch (err) {
        const msg = getApiErrorMsg(
          AI_ERROR_MAP,
          err,
          "Không thể áp dụng số lượng đề xuất.",
        );
        toast.error("Lỗi", msg);
      } finally {
        dispatch(setMutating(false));
      }
    },
    [dispatch, toast],
  );

  // Generate dynamic pricing recommendations
  const generatePricing = useCallback(
    async (date) => {
      dispatch(setLoading(true));
      try {
        const data = await aiApi.generatePricingRecommendations(date);
        dispatch(setInsight(data));
        toast.success("Thành công", "Đã tạo đề xuất định giá động thành công.");
      } catch (err) {
        const msg = getApiErrorMsg(
          AI_ERROR_MAP,
          err,
          "Không thể tạo đề xuất định giá.",
        );
        toast.error("Lỗi", msg);
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, toast],
  );

  // Apply dynamic pricing discounts
  const applyPricing = useCallback(
    async (insightId, updates) => {
      dispatch(setMutating(true));
      try {
        const data = await aiApi.applyPricingRecommendations(
          insightId,
          updates,
        );
        dispatch(setInsight(data));
        toast.success("Thành công", "Đã cập nhật giá bán món ăn theo đề xuất.");
      } catch (err) {
        const msg = getApiErrorMsg(
          AI_ERROR_MAP,
          err,
          "Không thể áp dụng giá bán đề xuất.",
        );
        toast.error("Lỗi", msg);
      } finally {
        dispatch(setMutating(false));
      }
    },
    [dispatch, toast],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  const changeSelectedDate = useCallback(
    (date) => {
      dispatch(setSelectedDate(date));
    },
    [dispatch],
  );

  const changeActiveTab = useCallback(
    (tab) => {
      dispatch(setActiveTab(tab));
    },
    [dispatch],
  );

  const resetState = useCallback(() => {
    dispatch(resetAiState());
  }, [dispatch]);

  // ── Effects ────────────────────────────────────────────────────────────────

  // Automatically fetch insight and versions list when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      fetchInsight(selectedDate);
      fetchVersions(selectedDate);
    }
  }, [selectedDate, fetchInsight, fetchVersions]);


  return {
    insight,
    isLoading,
    isMutating,
    error,
    selectedDate,
    activeTab,
    versions,
    fetchInsight,
    fetchVersions,
    changeSelectedDate,
    changeActiveTab,
    resetState,
    generateDailyInsight,
    applyForecast,
    generatePricing,
    applyPricing,
  };
};

export default useAiInsight;
