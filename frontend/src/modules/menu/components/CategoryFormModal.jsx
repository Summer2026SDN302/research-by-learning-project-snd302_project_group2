import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoryFormSchema } from "../validation/categorySchema";
import { DEFAULT_CATEGORY_ICON } from "../constants/categoryConstants";
import CategoryIconPicker from "./CategoryIconPicker";

const MODAL_CONFIG = {
  create: {
    title: "Thêm danh mục mới",
    subtitle: "Phân loại theo loại món: cơm, phở–bún–mì, đồ uống, ăn vặt...",
    submitLabel: "Tạo danh mục",
  },
  edit: {
    title: "Cập nhật danh mục",
    subtitle: "Chỉnh sửa thông tin và cấu hình danh mục thực đơn.",
    submitLabel: "Lưu thay đổi",
  },
};

const defaultValues = {
  name: "",
  description: "",
  icon: DEFAULT_CATEGORY_ICON,
  isActive: true,
};

const CategoryFormModal = ({
  open,
  mode,
  category,
  isSubmitting,
  serverFieldError,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });

  const selectedIcon = watch("icon");
  const isActive = watch("isActive");
  const config = MODAL_CONFIG[mode] ?? MODAL_CONFIG.create;

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && category) {
      reset({
        name: category.name ?? "",
        description: category.description ?? "",
        icon: category.icon ?? DEFAULT_CATEGORY_ICON,
        isActive: category.isActive ?? true,
      });
    } else {
      reset(defaultValues);
    }
  }, [open, mode, category, reset]);

  useEffect(() => {
    if (serverFieldError?.field) {
      setError(serverFieldError.field, { message: serverFieldError.message });
    }
  }, [serverFieldError, setError]);

  if (!open) return null;

  const handleClose = () => onClose(isDirty);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="relative bg-surface-container-lowest w-full max-w-2xl rounded-xl shadow-lg border border-outline-variant overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-start gap-4">
          <div>
            <h3 className="text-headline-sm font-bold text-on-surface">{config.title}</h3>
            <p className="text-body-sm text-on-surface-variant mt-1">{config.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-surface-container transition-colors shrink-0"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="block text-label-md font-semibold text-on-surface-variant mb-1.5">
              Tên danh mục *
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="VD: Cơm trưa, Bún & Mì, Đồ uống..."
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
            {errors.name && (
              <p className="text-error text-body-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-label-md font-semibold text-on-surface-variant mb-1.5">
              Chọn biểu tượng
            </label>
            <CategoryIconPicker
              value={selectedIcon ?? DEFAULT_CATEGORY_ICON}
              onChange={(icon) => setValue("icon", icon, { shouldDirty: true })}
            />
            {errors.icon && (
              <p className="text-error text-body-sm mt-1">{errors.icon.message}</p>
            )}
          </div>

          <div>
            <label className="block text-label-md font-semibold text-on-surface-variant mb-1.5">
              Mô tả danh mục
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="VD: Các món cơm trưa phục vụ từ 10h30–13h30..."
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
            />
            {errors.description && (
              <p className="text-error text-body-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
            <div>
              <p className="text-label-md font-bold text-on-surface">Trạng thái hoạt động</p>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Cho phép danh mục hiển thị trên thực đơn POS.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isActive}
                onChange={(e) => setValue("isActive", e.target.checked, { shouldDirty: true })}
              />
              <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg text-body-sm font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="material-symbols-outlined animate-spin text-[18px]">
                  progress_activity
                </span>
              )}
              {config.submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
