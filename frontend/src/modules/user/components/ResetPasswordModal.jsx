import { useEffect } from "react";
import { createPortal } from "react-dom";

import PasswordInput from "../../../components/form/PasswordInput";
import Spinner from "../../../components/feedback/Spinner";

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 pr-11 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

const ResetPasswordModal = ({
  user,
  formData,
  fieldErrors,
  isSaving,
  onChange,
  onSubmit,
  onClose,
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

      <section className="relative w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-elevated">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[32px]">lock_reset</span>
          </div>
          <h2 className="text-headline-sm font-bold text-on-surface">Đặt lại mật khẩu</h2>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            Cập nhật mật khẩu cho {user.fullName || user.username}. Người dùng sẽ cần đăng nhập lại.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <PasswordInput
            id="newPassword"
            name="newPassword"
            label="Mật khẩu mới"
            value={formData.newPassword}
            onChange={onChange}
            error={fieldErrors.newPassword}
            helper="Ít nhất 6 ký tự và không được chỉ gồm khoảng trắng."
            autoComplete="new-password"
            disabled={isSaving}
            placeholder="Ít nhất 6 ký tự"
            inputClassName={inputClass}
          />

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            value={formData.confirmPassword}
            onChange={onChange}
            error={fieldErrors.confirmPassword}
            helper="Nhập lại đúng mật khẩu mới để tránh nhầm lẫn."
            autoComplete="new-password"
            disabled={isSaving}
            placeholder="Nhập lại mật khẩu mới"
            inputClassName={inputClass}
          />

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
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
              Đặt lại
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
};

export default ResetPasswordModal;
