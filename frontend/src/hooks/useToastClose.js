import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { removeToast } from "../app/toastSlice";

/**
 * useToastClose
 *
 * Hook for dismissing a toast from the Redux store.
 * Used by ToastContainer to handle close events.
 *
 * @returns {fn} handleClose – (id: string) => void
 */
const useToastClose = () => {
  const dispatch = useDispatch();

  /** Dispatch removeToast when a toast is dismissed */
  const handleClose = useCallback(
    (id) => dispatch(removeToast(id)),
    [dispatch],
  );

  return handleClose;
};

export default useToastClose;
