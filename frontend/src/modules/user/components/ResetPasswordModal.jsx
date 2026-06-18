import { useEffect } from "react";
import { createPortal } from "react-dom";

import PasswordInput from "../../../components/form/PasswordInput";
import Spinner from "../../../components/feedback/Spinner";

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

const passwordInputClass = `${inputClass} pr-11`;

const ResetPasswordModal = ({
  user,
  formData,
  fieldErrors,
  isSaving,
  onChange,
  onSubmit,
  onClose,
  error,
}) => {
  useEffect(() => {
    if (!user) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [user]);

  if (!user) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex min-h-dvh items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-black/45 backdrop-blur-sm"
        onClick={onClose}
        disabled={isSaving}
        aria-label="Đóng modal đặt lại mật khẩu"
      />

      <section className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-elevated">
        <div className="flex items-start justify-between border-b border-outline-variant px-6 py-5">
          <div>
            <p className="font-label-md text-label-md uppercase tracking-wider text-primary">
              Quản lý tài khoản
            </p>
            <h2 className="mt-1 text-headline-sm font-bold text-on-surface">
              Đặt lại mật khẩu
            </h2>
          </div>

          <button
            type="button"
            className="rounded-full p-2 text-outline hover:bg-surface-container hover:text-on-surface disabled:opacity-50"
            disabled={isSaving}
            onClick={onClose}
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="max-h-[calc(100dvh-9rem)] space-y-5 overflow-y-auto px-6 py-6" onSubmit={onSubmit}>
          <div className="rounded-lg bg-surface-container-low p-4 text-body-sm text-on-surface-variant">
            Bạn đang đặt lại mật khẩu cho tài khoản <strong>{user.fullName || user.username}</strong> (@{user.username}).
          </div>

          <div className="space-y-4">
            <PasswordInput
              id="newPassword"
              name="newPassword"
              label="Mật khẩu mới"
              value={formData.newPassword || ""}
              onChange={onChange}
              error={fieldErrors.newPassword}
              helper="Mật khẩu mới phải có ít nhất 6 ký tự và không chỉ gồm khoảng trắng."
              autoComplete="new-password"
              disabled={isSaving}
              placeholder="Nhập mật khẩu mới"
              inputClassName={passwordInputClass}
              wrapperClassName="w-full"
            />

            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              value={formData.confirmPassword || ""}
              onChange={onChange}
              error={fieldErrors.confirmPassword}
              helper="Nhập lại mật khẩu mới để xác nhận."
              autoComplete="new-password"
              disabled={isSaving}
              placeholder="Nhập lại mật khẩu mới"
              inputClassName={passwordInputClass}
              wrapperClassName="w-full"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-error/20 bg-error-container/40 px-4 py-3 text-body-sm text-on-error-container" role="alert">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-outline-variant pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="rounded-lg border border-outline-variant px-4 py-2.5 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container disabled:opacity-50"
              onClick={onClose}
              disabled={isSaving}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-label-md text-label-md text-on-primary shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving && <Spinner size="sm" />}
              Lưu mật khẩu mới
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
};

export default ResetPasswordModal;
