import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { addToast } from "../app/toastSlice";

/**
 * useAppToast
 *
 * Shared hook for dispatching toast notifications via Redux.
 * Use this in any hook or page instead of managing toast state locally.
 *
 * @returns {object}
 *   toast  {object} – helpers: success(title, msg), error, warning, info
 *
 * Usage:
 *   const { toast } = useAppToast();
 *   toast.success('Thành công', 'Đã lưu dữ liệu');
 *   toast.error('Lỗi', 'Không thể kết nối server');
 */
const useAppToast = () => {
  const dispatch = useDispatch();

  /** Dispatch a toast with given type */
  const add = useCallback(
    (type, title, message, duration = 3000) => {
      dispatch(addToast({ type, title, message, duration }));
    },
    [dispatch],
  );

  /** Memoize helpers to avoid new object on every render */
  const toast = useMemo(
    () => ({
      success: (title, message, duration) =>
        add("success", title, message, duration),
      error: (title, message, duration) =>
        add("error", title, message, duration),
      warning: (title, message, duration) =>
        add("warning", title, message, duration),
      info: (title, message, duration) => add("info", title, message, duration),
    }),
    [add],
  );

  return { toast };
};

export default useAppToast;
