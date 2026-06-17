import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import useDropdownToggle from "../../../../hooks/useDropdownToggle";
import useClickOutside from "../../../../hooks/useClickOutside";

const DROPDOWN_KEY = "actions";

/**
 * RowActionsMenu
 *
 * Dropdown menu containing three actions: Edit, View History, and Remove.
 * Rendered via React Portal to prevent overflow issues inside table components.
 */
const RowActionsMenu = ({
  row,
  onEdit,
  onViewHistory,
  onRemove,
  isToday = true,
}) => {
  const { openDropdown, toggleDropdown, closeDropdown } = useDropdownToggle();
  const [coords, setCoords] = useState({
    top: undefined,
    bottom: undefined,
    left: 0,
  });

  const ref = useRef(null);

  const isOpen = openDropdown === DROPDOWN_KEY;

  useClickOutside(ref, isOpen, closeDropdown);

  const updateCoords = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const dropdownWidth = 192; // w-48 is 12rem = 192px

      // Align dropdown to the right edge of the trigger button
      const left = rect.right - dropdownWidth;

      if (spaceBelow < 200) {
        setCoords({
          top: undefined,
          bottom: viewportHeight - rect.top + 6,
          left: left,
        });
      } else {
        setCoords({
          top: rect.bottom + 6,
          bottom: undefined,
          left: left,
        });
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      // Close dropdown on scroll or resize to avoid floating alignment issues
      window.addEventListener("scroll", closeDropdown, true);
      window.addEventListener("resize", closeDropdown);
    }
    return () => {
      window.removeEventListener("scroll", closeDropdown, true);
      window.removeEventListener("resize", closeDropdown);
    };
  }, [isOpen, closeDropdown]);

  const handleToggle = (e) => {
    e.stopPropagation();
    toggleDropdown(DROPDOWN_KEY);
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={handleToggle}
        className="rounded-xl p-2 text-outline hover:bg-surface-container-high/60 hover:text-on-surface hover:scale-[1.08] active:scale-[0.92] transition-all duration-200 flex items-center justify-center"
        title="Thao tác"
      >
        <span className="material-symbols-outlined text-[22px]">more_vert</span>
      </button>

      {isOpen &&
        createPortal(
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: coords.top !== undefined ? `${coords.top}px` : "auto",
              bottom:
                coords.bottom !== undefined ? `${coords.bottom}px` : "auto",
              left: `${coords.left}px`,
            }}
            className="z-[999] w-48 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-1.5"
          >
            {/* {isToday && ( */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeDropdown();
                onEdit?.(row._raw);
              }}
              className="group relative flex w-full items-center gap-3 px-4 py-2.5 text-body-sm text-on-surface hover:bg-primary/8 hover:text-primary transition-all duration-200 text-left"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-primary transition-colors duration-200">
                edit
              </span>
              <span className="font-medium">Chỉnh sửa</span>
            </button>
            {/* )} */}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeDropdown();
                onViewHistory?.(row._raw);
              }}
              className="group relative flex w-full items-center gap-3 px-4 py-2.5 text-body-sm text-on-surface hover:bg-secondary/8 hover:text-secondary transition-all duration-200 text-left"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-secondary transition-colors duration-200">
                history
              </span>
              <span className="font-medium">Lịch sử giá</span>
            </button>

            {isToday && row.soldQuantity === 0 && (
              <>
                <div className="my-1.5 border-t border-outline-variant/40" />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeDropdown();
                    onRemove?.(row._raw);
                  }}
                  className="group relative flex w-full items-center gap-3 px-4 py-2.5 text-body-sm text-error hover:bg-error/8 hover:text-error transition-all duration-200 text-left"
                >
                  <span className="material-symbols-outlined text-[20px] text-error/80 group-hover:text-error transition-colors duration-200">
                    delete
                  </span>
                  <span className="font-semibold">Xóa khỏi thực đơn</span>
                </button>
              </>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default RowActionsMenu;
