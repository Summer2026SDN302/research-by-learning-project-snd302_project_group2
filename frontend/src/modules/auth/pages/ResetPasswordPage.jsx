import { Link } from "react-router-dom";

import PasswordInput from "../../../components/form/PasswordInput";
import Spinner from "../../../components/feedback/Spinner";
import useResetPassword from "../hooks/useResetPassword";

const authInputClass =
  "w-full pl-11 pr-4 py-3 bg-surface rounded-lg border text-on-surface font-body-md text-body-md placeholder-on-surface-variant/50 focus:border-primary focus:ring-[3px] focus:ring-primary-container/30 focus:outline-none transition-all duration-200";

const ResetPasswordPage = () => {
  const {
    formData,
    fieldErrors,
    formError,
    isLoading,
    isSuccess,
    handleChange,
    handleSubmit,
    goToLogin,
    goToForgotPassword,
  } = useResetPassword();

  return (
    <div className="bg-background min-h-screen flex items-center justify-center relative overflow-hidden tech-bg text-on-background px-4">
      <div className="absolute inset-0 grid-overlay pointer-events-none" />

      <div className="w-full max-w-[440px] md:px-0 z-10 relative">
        <div className="bg-surface-container-lowest rounded-[16px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),_0_8px_10px_-6px_rgba(0,0,0,0.01)] border border-outline-variant/30 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-primary-fixed" />

          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span
                  className="material-symbols-outlined text-primary text-[32px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  point_of_sale
                </span>
                <h1 className="font-headline-lg text-headline-lg font-black text-primary tracking-tight">
                  StallBox
                </h1>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Nhập OTP và mật khẩu mới
              </p>
            </div>

            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container">
                <span className="material-symbols-outlined text-[32px]">lock_reset</span>
              </div>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                Đặt lại mật khẩu
              </h2>
              <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                Nhập email, mã OTP 6 chữ số đã nhận và mật khẩu mới cho tài khoản của bạn.
              </p>
            </div>

            {formError && (
              <div className="mb-5 rounded-lg border border-error/20 bg-error-container/40 px-4 py-3 text-body-sm text-on-error-container">
                {formError}
              </div>
            )}

            {isSuccess ? (
              <div className="space-y-6">
                <div className="rounded-lg border border-secondary/20 bg-secondary-container/20 px-4 py-3 text-body-sm text-secondary">
                  Mật khẩu đã được cập nhật. Hãy đăng nhập lại bằng mật khẩu mới.
                </div>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-surface-tint text-on-primary font-headline-sm text-headline-sm py-3 px-4 rounded-[8px] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                  onClick={goToLogin}
                >
                  <span className="material-symbols-outlined">login</span>
                  Về trang đăng nhập
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    className="block font-label-md text-label-md text-on-surface uppercase tracking-wider"
                    htmlFor="email"
                  >
                    Email đã nhận OTP
                  </label>

                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">
                      mail
                    </span>

                    <input
                      className={`${authInputClass} ${
                        fieldErrors.email ? "border-error" : "border-outline-variant"
                      }`}
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </div>

                  {fieldErrors.email ? (
                    <p className="text-body-sm text-error">{fieldErrors.email}</p>
                  ) : (
                    <p className="text-body-sm text-on-surface-variant/70">
                      Dùng đúng email vừa yêu cầu gửi mã OTP.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    className="block font-label-md text-label-md text-on-surface uppercase tracking-wider"
                    htmlFor="otp"
                  >
                    Mã OTP
                  </label>

                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">
                      pin
                    </span>

                    <input
                      className={`${authInputClass} text-center tracking-[0.35em] font-bold ${
                        fieldErrors.otp ? "border-error" : "border-outline-variant"
                      }`}
                      id="otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="000000"
                      autoComplete="one-time-code"
                      disabled={isLoading}
                    />
                  </div>

                  {fieldErrors.otp ? (
                    <p className="text-body-sm text-error">{fieldErrors.otp}</p>
                  ) : (
                    <p className="text-body-sm text-on-surface-variant/70">
                      OTP gồm 6 chữ số và sẽ hết hạn sau vài phút.
                    </p>
                  )}
                </div>

                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  label="Mật khẩu mới"
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={fieldErrors.newPassword}
                  helper="Ít nhất 6 ký tự và không được chỉ gồm khoảng trắng."
                  placeholder="Ít nhất 6 ký tự"
                  autoComplete="new-password"
                  disabled={isLoading}
                  leftIcon="lock"
                  inputClassName={authInputClass}
                  labelClassName="block font-label-md text-label-md text-on-surface uppercase tracking-wider"
                  wrapperClassName="space-y-2"
                />

                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={fieldErrors.confirmPassword}
                  helper="Nhập lại đúng mật khẩu mới để tránh nhầm lẫn."
                  placeholder="Nhập lại mật khẩu mới"
                  autoComplete="new-password"
                  disabled={isLoading}
                  leftIcon="verified_user"
                  inputClassName={authInputClass}
                  labelClassName="block font-label-md text-label-md text-on-surface uppercase tracking-wider"
                  wrapperClassName="space-y-2"
                />

                <div className="space-y-3 pt-4">
                  <button
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-surface-tint text-on-primary font-headline-sm text-headline-sm py-3 px-4 rounded-[8px] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-primary disabled:active:scale-100"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" />
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">check_circle</span>
                        Cập nhật mật khẩu
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-2 font-label-md text-label-md text-primary hover:text-surface-tint transition-colors"
                    onClick={goToForgotPassword}
                    disabled={isLoading}
                  >
                    <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                    Gửi lại OTP
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-surface-container-low py-4 px-8 border-t border-outline-variant/20 flex items-center justify-center gap-2">
            <Link
              className="inline-flex items-center gap-2 font-label-md text-label-md text-primary hover:text-surface-tint transition-colors"
              to="/login"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Quay lại đăng nhập
            </Link>
          </div>
        </div>

        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-primary/10 blur-xl rounded-full pointer-events-none -z-10" />
      </div>
    </div>
  );
};

export default ResetPasswordPage;