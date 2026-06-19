import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm, useWatch } from "react-hook-form";
import Spinner from "../../../../components/feedback/Spinner";
import { DAILY_MENU_ITEM_STATUS } from "../../constants/dailyMenuConstants";
import { updateItemSchema } from "../../validation/dailyMenuSchema";
import { formatCurrency } from "../../../../utils/formatters";
import useAppToast from "../../../../hooks/useAppToast";

// Parser to convert form input strings to numbers or undefined
const parseFormValues = (values) => {
  const parsed = { ...values };

  if (
    parsed.preparedQuantity === "" ||
    parsed.preparedQuantity === null ||
    parsed.preparedQuantity === undefined
  ) {
    parsed.preparedQuantity = undefined;
  } else {
    parsed.preparedQuantity = Number(parsed.preparedQuantity);
  }

  if (
    parsed.currentPrice === "" ||
    parsed.currentPrice === null ||
    parsed.currentPrice === undefined
  ) {
    parsed.currentPrice = undefined;
  } else {
    parsed.currentPrice = Number(parsed.currentPrice);
  }

  return parsed;
};

// Custom resolver that wraps our Zod schema
const makeResolver = (item) => (values) => {
  const parsedValues = parseFormValues(values);

  // Extend the base schema dynamically with custom validations (e.g. preparedQuantity >= soldQuantity)
  const refinedSchema = updateItemSchema.superRefine((data, ctx) => {
    if (
      data.preparedQuantity !== undefined &&
      data.preparedQuantity < (item?.soldQuantity || 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message: `SL chuẩn bị không thể nhỏ hơn SL đã bán (${item?.soldQuantity || 0})`,
        path: ["preparedQuantity"],
      });
    }
  });

  const result = refinedSchema.safeParse(parsedValues);

  if (result.success) {
    return { values: result.data, errors: {} };
  } else {
    const errors = {};
    result.error.issues.forEach((err) => {
      const field = err.path[0] || "root";
      errors[field] = {
        type: err.code || "validation",
        message: err.message,
      };
    });
    return { values: {}, errors };
  }
};

/**
 * UpdateItemModal
 *
 * Props:
 *   open       {boolean}
 *   item       {object}    – daily menu item (with foodItemId populated)
 *   onSubmit   {fn}        – (payload) => void
 *   onClose    {fn}
 *   isLoading  {boolean}
 */
const UpdateItemModal = ({ open, item, onSubmit, onClose, isLoading }) => {
  const { toast } = useAppToast();

  const resolver = useMemo(() => makeResolver(item), [item]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    resolver,
  });

  // Watch currentPrice to determine whether to show the price-change reason input
  const watchedPrice = useWatch({
    control,
    name: "currentPrice",
  });

  useEffect(() => {
    if (item) {
      reset({
        preparedQuantity: item.preparedQuantity ?? "",
        currentPrice: item.currentPrice ?? "",
        status: item.status ?? DAILY_MENU_ITEM_STATUS.AVAILABLE,
        reason: "",
      });
    }
  }, [item, reset]);

  if (!open || !item) return null;

  const onFormSubmit = (data) => {
    const payload = {};

    if (
      data.preparedQuantity !== undefined &&
      data.preparedQuantity !== item.preparedQuantity
    ) {
      payload.preparedQuantity = data.preparedQuantity;
    }

    if (
      data.currentPrice !== undefined &&
      data.currentPrice !== item.currentPrice
    ) {
      payload.currentPrice = data.currentPrice;
      if (data.reason && data.reason.trim()) {
        payload.reason = data.reason.trim();
      }
    }

    if (data.status !== item.status) {
      payload.status = data.status;
    }

    if (Object.keys(payload).length === 0) {
      toast.info("Thông báo", "Không có thay đổi nào được thực hiện.");
      onClose();
      return;
    }

    onSubmit(payload);
  };

  const foodName = item.foodItemId?.name ?? "Món ăn";

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Dialog */}
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-elevated p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">
              edit_note
            </span>
          </div>
          <div>
            <h3 className="text-headline-sm font-bold text-on-surface">
              Cập nhật món
            </h3>
            <p className="text-body-sm text-on-surface-variant">{foodName}</p>
          </div>
        </div>

        {/* Info chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px]">sell</span>
            Giá gốc: {formatCurrency(item.originalPrice)}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px]">
              shopping_cart
            </span>
            Đã bán: {item.soldQuantity ?? 0}
          </span>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {errors.root && (
            <div className="p-3 rounded-lg bg-error-container/20 text-error text-body-sm font-medium">
              {errors.root.message}
            </div>
          )}
          {/* Prepared Quantity */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              SL chuẩn bị
            </label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Nhập số lượng"
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-4 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              {...register("preparedQuantity")}
            />
            {errors.preparedQuantity && (
              <p className="text-[11px] text-error mt-1">
                {errors.preparedQuantity.message}
              </p>
            )}
          </div>

          {/* Current Price */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              Giá hiện tại (VND)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="Nhập giá"
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-4 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              {...register("currentPrice")}
            />
            {errors.currentPrice && (
              <p className="text-[11px] text-error mt-1">
                {errors.currentPrice.message}
              </p>
            )}
          </div>

          {/* Reason (shown when price changed) */}
          {watchedPrice !== "" &&
            watchedPrice !== undefined &&
            !isNaN(Number(watchedPrice)) &&
            Number(watchedPrice) !== item.currentPrice && (
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1.5">
                  Lý do thay đổi giá
                </label>
                <textarea
                  placeholder="(Không bắt buộc)"
                  rows={2}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-4 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                  {...register("reason")}
                />
              </div>
            )}

          {/* Status */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              Trạng thái
            </label>
            <select
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-4 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer appearance-none"
              {...register("status")}
            >
              <option value={DAILY_MENU_ITEM_STATUS.AVAILABLE}>Sẵn sàng</option>
              <option value={DAILY_MENU_ITEM_STATUS.UNAVAILABLE}>Ngừng</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl border border-outline-variant text-body-sm font-semibold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-body-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Spinner size="sm" />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default UpdateItemModal;
