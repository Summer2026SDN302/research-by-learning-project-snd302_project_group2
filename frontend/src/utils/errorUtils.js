/**
 * Utility functions for error handling.
 */

/**
 * Extract a human-readable error message from an API error response.
 *
 * Each module is responsible for defining its own `errorMap` (a plain object
 * mapping backend error codes to Vietnamese messages) and passing it here.
 * This keeps module-specific error strings co-located with the module's
 * constants rather than hardcoded in a shared utility.
 *
 * @param {Record<string, string>} errorMap - Module-specific error code map.
 * @param {any} err - The caught error from an API call.
 * @param {string} [fallback] - Fallback message when no mapping is found.
 * @returns {string}
 *
 * @example
 * // In a module hook:
 * import { DAILY_MENU_ERROR_MAP } from '../../constants/dailyMenuConstants';
 * import { getApiErrorMsg } from '../../../../utils/errorUtils';
 *
 * catch (err) {
 *   toast.error('Thất bại', getApiErrorMsg(DAILY_MENU_ERROR_MAP, err));
 * }
 */
export const getApiErrorMsg = (
  errorMap,
  err,
  fallback = "Có lỗi xảy ra, vui lòng thử lại.",
) => {
  const code = err?.code || err?.response?.data?.error?.code;
  if (code && errorMap?.[code]) {
    return errorMap[code];
  }
  return err?.response?.data?.message || fallback;
};
