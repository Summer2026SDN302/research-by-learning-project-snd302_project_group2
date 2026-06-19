import { useCallback } from "react";
import useAppToast from "@/hooks/useAppToast";

const TOAST_TITLES = {
  success: "Thành công",
  error: "Lỗi",
  warning: "Cảnh báo",
  info: "Thông tin",
};

/**
 * Shortcut toast: notify(message, type) — auto title theo type.
 */
const useNotify = () => {
  const { toast } = useAppToast();

  const notify = useCallback(
    (message, type = "success") => {
      toast[type]?.(TOAST_TITLES[type] ?? TOAST_TITLES.success, message);
    },
    [toast],
  );

  return { notify };
};

export default useNotify;
