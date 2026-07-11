import { createPortal } from "react-dom";

/**
 * AiInsightDetailModal — Generic modal backdrop/shell used by forecast and pricing detail modals.
 * Children are rendered inside the modal card.
 */
const AiInsightDetailModal = ({ onClose, children }) => {
  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-xl max-w-md w-full border border-outline-variant p-6 shadow-xl animate-fade-in relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-low transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default AiInsightDetailModal;
