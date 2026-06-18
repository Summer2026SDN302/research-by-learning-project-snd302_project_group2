import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { foodItemFormSchema } from "../validation/foodItemSchema";
import Spinner from "@/components/feedback/Spinner";

const MODAL_CONFIG = {
  create: {
    title: "Thêm món ăn mới",
    subtitle: "Tạo món ăn mới để quản lý trong thực đơn.",
    submitLabel: "Tạo món ăn",
    icon: "add_circle",
  },
  edit: {
    title: "Cập nhật món ăn",
    subtitle: "Chỉnh sửa thông tin món ăn",
    submitLabel: "Lưu thay đổi",
    icon: "edit_note",
  },
};

const defaultValues = {
  categoryId: "",
  name: "",
  description: "",
  basePrice: "",
  cost: "",
};

const parseMoneyValue = (value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  return Number(value);
};

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-outline-variant/80 bg-surface-container-lowest text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all";

const labelClass = "block text-label-md font-bold text-on-surface-variant mb-2";

const FoodItemFormModal = ({
  open,
  mode,
  foodItem,
  categoryOptions = [],
  categoryOptionsLoading = false,
  categoryOptionsError = null,
  isSubmitting,
  serverFieldErrors = {},
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(foodItemFormSchema),
    defaultValues,
  });

  const config = MODAL_CONFIG[mode] ?? MODAL_CONFIG.create;

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && foodItem) {
      reset({
        categoryId: foodItem.categoryId ?? foodItem.category?._id ?? "",
        name: foodItem.name ?? "",
        description: foodItem.description ?? "",
        basePrice: foodItem.basePrice ?? "",
        cost: foodItem.cost ?? "",
      });
    } else {
      reset(defaultValues);
    }
    clearErrors();
  }, [clearErrors, foodItem, mode, open, reset]);

  useEffect(() => {
    clearErrors();
    Object.entries(serverFieldErrors ?? {}).forEach(([field, message]) => {
      if (field && message) {
        setError(field, { message });
      }
    });
  }, [clearErrors, serverFieldErrors, setError]);

  if (!open) return null;

  const handleClose = () => onClose(isDirty);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-on-surface/30 backdrop-blur-[3px]"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="relative bg-surface-container-lowest w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-elevated border border-outline-variant/60 overflow-hidden flex flex-col">
        <div className="px-6 sm:px-8 py-6 border-b border-outline-variant/60 flex justify-between items-start gap-4 bg-gradient-to-r from-surface-container-lowest to-surface-container-low/50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">
                {config.icon}
              </span>
            </div>
            <div>
              <h3 className="text-headline-sm font-bold text-on-surface">
                {config.title}
              </h3>
              <p className="text-body-sm text-on-surface-variant mt-1">
                {config.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 sm:px-8 sm:pb-8 space-y-5 overflow-y-auto flex-1"
        >
          <div>
            <label className={labelClass}>Danh mục *</label>
            <select
              {...register("categoryId")}
              disabled={categoryOptionsLoading || categoryOptions.length === 0}
              className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <option value="">Chọn danh mục...</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {categoryOptionsError && (
              <p className="text-tertiary text-body-sm mt-1.5">
                {categoryOptionsError}
              </p>
            )}
            {!categoryOptionsLoading &&
              categoryOptions.length === 0 &&
              !categoryOptionsError && (
                <p className="text-on-surface-variant text-body-sm mt-1.5">
                  Chưa có danh mục để gán món ăn.
                </p>
              )}
            {errors.categoryId && (
              <p className="text-error text-body-sm mt-1.5">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Tên món ăn *</label>
            <input
              {...register("name")}
              type="text"
              placeholder="Ví dụ: Cơm gà xối mỡ..."
              className={inputClass}
            />
            {errors.name && (
              <p className="text-error text-body-sm mt-1.5">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Mô tả món ăn</label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Thêm mô tả ngắn gọn..."
              className={`${inputClass} resize-none`}
            />
            {errors.description && (
              <p className="text-error text-body-sm mt-1.5">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Giá bán *</label>
              <input
                {...register("basePrice", { setValueAs: parseMoneyValue })}
                type="number"
                min="0"
                step="1000"
                placeholder="0"
                className={inputClass}
              />
              {errors.basePrice && (
                <p className="text-error text-body-sm mt-1.5">
                  {errors.basePrice.message}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Giá vốn *</label>
              <input
                {...register("cost", { setValueAs: parseMoneyValue })}
                type="number"
                min="0"
                step="1000"
                placeholder="0"
                className={inputClass}
              />
              {errors.cost && (
                <p className="text-error text-body-sm mt-1.5">
                  {errors.cost.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl text-body-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl text-body-sm font-bold bg-primary text-on-primary hover:opacity-90 shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Spinner size="sm" />}
              {config.submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FoodItemFormModal;
