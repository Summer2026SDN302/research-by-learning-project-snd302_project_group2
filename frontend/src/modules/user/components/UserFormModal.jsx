import { useEffect } from "react";
import { createPortal } from "react-dom";

import PasswordInput from "../../../components/form/PasswordInput";
import Spinner from "../../../components/feedback/Spinner";
import { USER_ROLE_OPTIONS } from "../constants/userConstants";

const baseInputClass =
  "w-full rounded-lg border bg-surface-container-lowest px-3 py-2.5 text-body-sm text-on-surface placeholder:text-outline/50 transition-all duration-200 focus:outline-none focus:ring-2 disabled:bg-surface-container-low/50 disabled:text-on-surface/40";

const getInputClass = (hasError) =>
  `${baseInputClass} ${
    hasError
      ? "border-error focus:border-error focus:ring-error/15"
      : "border-outline-variant focus:border-primary focus:ring-primary/15"
  }`;

const passwordInputClass = `${baseInputClass} pr-11`;

const FieldError = ({ message, helper }) => {
  if (message)
    return (
      <p className="mt-1 text-body-sm font-semibold text-error animate-fade-in">
        {message}
      </p>
    );
  if (helper)
    return (
      <p className="mt-1 text-body-sm text-on-surface-variant/70">{helper}</p>
    );
  return null;
};

const UserFormModal = ({
  open,
  mode,
  formData,
  fieldErrors,
  isSaving,
  onChange,
  onSubmit,
  onClose,
  error,
}) => {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const isCreate = mode === "create";

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex min-h-dvh items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-black/45 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        disabled={isSaving}
        aria-label="Đóng modal người dùng"
      />

      <section className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-elevated z-10 animate-scale-up">
        <form onSubmit={onSubmit} className="flex flex-col overflow-hidden">
          <div className="flex items-start justify-between border-b border-outline-variant px-6 py-5 shrink-0 bg-surface-container-lowest">
            <div>
              <p className="font-label-md text-label-md uppercase tracking-wider text-primary">
                {isCreate ? "Tạo tài khoản" : "Cập nhật tài khoản"}
              </p>
              <h2 className="mt-1 text-headline-sm font-bold text-on-surface">
                {isCreate ? "Thêm người dùng mới" : "Chỉnh sửa người dùng"}
              </h2>
            </div>

            <button
              type="button"
              className="rounded-full p-2 text-outline hover:bg-surface-container hover:text-on-surface disabled:opacity-50 flex items-center justify-center transition-all duration-200"
              disabled={isSaving}
              onClick={onClose}
              aria-label="Đóng"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-5 overflow-y-auto px-6 py-6 flex-1 max-h-[calc(100dvh-12rem)]">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label
                  className="mb-1.5 block font-label-md text-label-md text-on-surface-variant/90"
                  htmlFor="username"
                >
                  Tên đăng nhập
                </label>
                <input
                  id="username"
                  name="username"
                  className={getInputClass(fieldErrors.username)}
                  value={formData.username}
                  onChange={onChange}
                  autoComplete="username"
                  disabled={isSaving}
                  placeholder="staff01"
                />
                <FieldError
                  message={fieldErrors.username}
                  helper="Ít nhất 4 ký tự, chỉ dùng chữ, số, dấu chấm, gạch dưới hoặc gạch ngang."
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block font-label-md text-label-md text-on-surface-variant/90"
                  htmlFor="role"
                >
                  Vai trò
                </label>
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    className={`${getInputClass(fieldErrors.role)} appearance-none pr-12 cursor-pointer`}
                    value={formData.role}
                    onChange={onChange}
                    disabled={isSaving}
                  >
                    {USER_ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
                    expand_more
                  </span>
                </div>
                <FieldError
                  message={fieldErrors.role}
                  helper="Chọn quyền phù hợp với tài khoản này."
                />
              </div>

              {isCreate && (
                <PasswordInput
                  id="password"
                  name="password"
                  label="Mật khẩu tạm thời"
                  value={formData.password}
                  onChange={onChange}
                  error={fieldErrors.password}
                  helper="Ít nhất 6 ký tự và không được chỉ gồm khoảng trắng."
                  autoComplete="new-password"
                  disabled={isSaving}
                  placeholder="Ít nhất 6 ký tự"
                  inputClassName={passwordInputClass}
                  wrapperClassName="md:col-span-2"
                />
              )}

              <div>
                <label
                  className="mb-1.5 block font-label-md text-label-md text-on-surface-variant/90"
                  htmlFor="fullName"
                >
                  Họ tên
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  className={getInputClass(fieldErrors.fullName)}
                  value={formData.fullName}
                  onChange={onChange}
                  autoComplete="name"
                  disabled={isSaving}
                  placeholder="Nguyễn Văn An"
                />
                <FieldError
                  message={fieldErrors.fullName}
                  helper="Tên hiển thị của người dùng trong hệ thống."
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block font-label-md text-label-md text-on-surface-variant/90"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  className={getInputClass(fieldErrors.email)}
                  value={formData.email}
                  onChange={onChange}
                  autoComplete="email"
                  disabled={isSaving}
                  placeholder="user@stallbox.com"
                />
                <FieldError
                  message={fieldErrors.email}
                  helper="Email hợp lệ, ví dụ: user@stallbox.com."
                />
              </div>

              <div className="md:col-span-2">
                <label
                  className="mb-1.5 block font-label-md text-label-md text-on-surface-variant/90"
                  htmlFor="phone"
                >
                  Số điện thoại
                </label>
                <input
                  id="phone"
                  name="phone"
                  className={getInputClass(fieldErrors.phone)}
                  value={formData.phone}
                  onChange={onChange}
                  autoComplete="tel"
                  disabled={isSaving}
                  placeholder="Tùy chọn"
                />
                <FieldError
                  message={fieldErrors.phone}
                  helper="Tùy chọn. Có thể nhập số điện thoại kèm mã vùng."
                />
              </div>
            </div>

            {error && (
              <div
                className="rounded-lg border border-error/20 bg-error-container/40 px-4 py-3 text-body-sm text-on-error-container animate-fade-in"
                role="alert"
              >
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-outline-variant px-6 py-5 sm:flex-row sm:justify-end shrink-0 bg-surface-container-lowest">
            <button
              type="button"
              className="rounded-lg border border-outline-variant px-4 py-2.5 font-label-md text-label-md text-on-surface-variant transition-all duration-200 hover:bg-surface-container disabled:opacity-50"
              onClick={onClose}
              disabled={isSaving}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-label-md text-label-md text-on-primary shadow-sm transition-all duration-200 hover:opacity-95 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving && <Spinner size="sm" />}
              {isCreate ? "Tạo người dùng" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
};

export default UserFormModal;
