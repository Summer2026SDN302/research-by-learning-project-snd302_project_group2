import { useSelector } from "react-redux";
import Toast from "./Toast";
import useToastClose from "../../hooks/useToastClose";
/**
 * ToastContainer
 *
 * Renders the list of active toasts in a fixed portal position (top-right).
 * Connects directly to Redux store — no props needed.
 * Mount once at root layout level.
 */
const ToastContainer = () => {
  const toasts = useSelector((state) => state.toast.items);
  const handleClose = useToastClose();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2" style={{ zIndex: 99999 }}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={handleClose} />
      ))}
    </div>
  );
};

export default ToastContainer;
