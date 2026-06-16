import PasswordInput from "../../../components/form/PasswordInput";
import Spinner from "../../../components/feedback/Spinner";
import PageHeader from "../../../components/layout/PageHeader";
import useChangePassword from "../hooks/useChangePassword";

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 pr-11 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

const ChangePasswordPage = () => {
  const {
    formData,
    fieldErrors,
    formError,
    isLoading,
    handleChange,
    handleSubmit,
  } = useChangePassword();

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Tài khoản" }, { label: "Đổi mật khẩu" }]}
        title="Đổi mật khẩu"
        subtitle="Sau khi đổi mật khẩu, phiên đăng nhập hiện tại sẽ kết thúc để bảo vệ tài khoản."
      />

      <form
        className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-soft"
        onSubmit={handleSubmit}
      >
        <div className="mb-6 flex items-start gap-4 rounded-xl bg-primary/10 p-4 text-primary">
          <span className="material-symbols-outlined text-[32px]">shield_lock</span>
          <div>
            <h2 className="text-headline-sm font-bold text-on-surface">Bảo mật tài khoản</h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Mật khẩu mới phải có ít nhất 6 ký tự và không được chỉ gồm khoảng trắng.
            </p>
          </div>
        </div>

        {formError && (
          <div className="mb-5 rounded-lg border border-error/20 bg-error-container/40 px-4 py-3 text-body-sm text-on-error-container">
            {formError}
          </div>
        )}

        <div className="space-y-5">
          <PasswordInput
            id="currentPassword"
            name="currentPassword"
            label="Mật khẩu hiện tại"
            value={formData.currentPassword}
            onChange={handleChange}
            error={fieldErrors.currentPassword}
            helper="Nhập mật khẩu hiện tại để xác nhận quyền đổi mật khẩu."
            autoComplete="current-password"
            disabled={isLoading}
            inputClassName={inputClass}
          />

          <PasswordInput
            id="newPassword"
            name="newPassword"
            label="Mật khẩu mới"
            value={formData.newPassword}
            onChange={handleChange}
            error={fieldErrors.newPassword}
            helper="Ít nhất 6 ký tự và phải khác mật khẩu hiện tại."
            autoComplete="new-password"
            disabled={isLoading}
            inputClassName={inputClass}
          />

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword}
            helper="Nhập lại mật khẩu mới giống phía trên."
            autoComplete="new-password"
            disabled={isLoading}
            inputClassName={inputClass}
          />
        </div>

        <div className="mt-6 flex justify-end border-t border-outline-variant pt-5">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-label-md text-label-md text-on-primary shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading && <Spinner size="sm" />}
            Đổi mật khẩu
          </button>
        </div>
      </form>
    </section>
  );
};

export default ChangePasswordPage;
