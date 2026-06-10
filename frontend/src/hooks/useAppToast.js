import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { addToast } from "../app/toastSlice";

const useAppToast = () => {
  const dispatch = useDispatch();

  const add = useCallback(
    (type, title, message, duration = 3000) => {
      dispatch(addToast({ type, title, message, duration }));
    },
    [dispatch],
  );

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