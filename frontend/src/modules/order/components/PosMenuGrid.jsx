import React from "react";
import { formatCurrency } from "@/utils/formatters";

const PosMenuGrid = ({ items = [], onAddItem, selectionMetaMap = {} }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 flex-1">
        <span className="material-symbols-outlined text-[64px] text-outline/40 mb-4">
          search_off
        </span>
        <p className="text-headline-sm font-bold text-on-surface mb-2">
          Khong tim thay mon an
        </p>
        <p className="text-body-sm text-on-surface-variant text-center max-w-xs">
          Vui long dieu chinh bo loc hoac tu khoa tim kiem.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 content-start gap-4 overflow-y-auto pb-8 pr-2 flex-1 min-h-0">
      {items.map((item) => {
        const {
          foodItemId,
          currentPrice,
          originalPrice,
          remainingQuantity,
          status,
        } = item;

        if (!foodItemId) {
          return null;
        }

        const selectionMeta = selectionMetaMap[foodItemId._id] || {};
        const actualRemainingQuantity =
          selectionMeta.actualRemainingQuantity ?? remainingQuantity ?? 0;
        const displayRemainingQuantity =
          selectionMeta.remainingSelectableQuantity ?? actualRemainingQuantity;
        const canIncreaseQuantity =
          selectionMeta.canIncreaseQuantity ?? actualRemainingQuantity > 0;
        const isUnavailable =
          status === "Unavailable" || displayRemainingQuantity <= 0;
        const isLowStock =
          !isUnavailable && displayRemainingQuantity > 0 && displayRemainingQuantity <= 3;
        const isAiPricing = currentPrice !== originalPrice;
        const isClickable = canIncreaseQuantity;

        return (
          <div
            key={foodItemId._id}
            onClick={() => {
              if (isClickable) {
                onAddItem(item);
              }
            }}
            className={`relative w-full h-[13rem] min-h-[13rem] max-h-[13rem] bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden flex flex-col py-2 transition-all duration-200 select-none ${
              isClickable
                ? "cursor-pointer hover:shadow-md hover:border-primary/50 group active:scale-[0.98]"
                : "opacity-70 cursor-not-allowed"
            }`}
          >
            {isAiPricing && !isUnavailable && (
              <div
                className="absolute top-2 right-2 bg-inverse-primary text-on-primary-fixed rounded-full p-1 shadow-sm z-10 flex items-center justify-center"
                title="Gia duoc toi uu boi AI"
              >
                <span className="material-symbols-outlined text-[16px]">
                  auto_awesome
                </span>
              </div>
            )}

            <div className="p-4 flex flex-col flex-1 min-h-[120px]">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-2">
                {foodItemId.name}
              </h3>
              <p className="font-body-md text-body-md text-primary font-bold mb-3">
                {formatCurrency(currentPrice)}
              </p>
              <div className="mt-auto flex items-end justify-between gap-3">
                {isUnavailable ? (
                  <div className="inline-flex items-center gap-1 bg-surface-container-highest text-on-surface-variant px-2 py-1 rounded-md w-fit">
                    <span className="material-symbols-outlined text-[14px]">
                      cancel
                    </span>
                    <span className="font-label-md text-[10px] uppercase">
                      Het hang
                    </span>
                  </div>
                ) : isLowStock ? (
                  <div className="inline-flex items-center gap-1 bg-tertiary-container bg-opacity-20 text-tertiary px-2 py-1 rounded-md w-fit">
                    <span className="material-symbols-outlined text-[14px]">
                      warning
                    </span>
                    <span className="font-label-md text-[10px] uppercase">
                      Sap het
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 bg-secondary-container bg-opacity-20 text-secondary px-2 py-1 rounded-md w-fit">
                    <span className="material-symbols-outlined text-[14px]">
                      check_circle
                    </span>
                    <span className="font-label-md text-[10px] uppercase">
                      Co san
                    </span>
                  </div>
                )}

                <p className="text-[12px] font-medium text-on-surface-variant">
                  Con lai:{" "}
                  <span className="font-semibold text-on-surface">
                    {displayRemainingQuantity}
                  </span>
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PosMenuGrid;
