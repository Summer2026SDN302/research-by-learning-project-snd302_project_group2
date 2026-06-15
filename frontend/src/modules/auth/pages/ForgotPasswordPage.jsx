import { Link } from "react-router-dom";

import Spinner from "../../../components/feedback/Spinner";
import useForgotPassword from "../hooks/useForgotPassword";

const ForgotPasswordPage = () => {
  const {
    email,
    normalizedEmail,
    fieldError,
    formError,
    isLoading,
    isSubmitted,
    handleChange,
    handleBlur,
    handleSubmit,
    goToResetPassword,
  } = useForgotPassword();

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
                Xác minh OTP để đặt lại mật khẩu
              </p>
            </div>

            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container">
                <span className="material-symbols-outlined text-[32px]">pin</span>
              </div>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                Quên mật khẩu?
              </h2>
              <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                Nhập email đã đăng ký, hệ thống sẽ gửi mã OTP 6 chữ số để bạn đặt lại mật khẩu.
              </p>
            </div>

            {formError && (
              <div className="mb-5 rounded-lg border border-error/20 bg-error-container/40 px-4 py-3 text-body-sm text-on-error-container">
                {formError}
              </div>
            )}

            {isSubmitted && (
              <div className="mb-5 rounded-lg border border-secondary/20 bg-secondary-container/20 px-4 py-3 text-body-sm text-secondary">
                Đã gửi mã OTP đến {normalizedEmail}. Vui lòng kiểm tra hộp thư đến hoặc thư rác.
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  className="block font-label-md text-label-md text-on-surface uppercase tracking-wider"
                  htmlFor="email"
                >
                  Email đã đăng ký
                </label>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">
                    mail
                  </span>

                  <input
                    className={`w-full pl-11 pr-4 py-3 bg-surface rounded-lg border text-on-surface font-body-md text-body-md placeholder-on-surface-variant/50 focus:border-primary focus:ring-[3px] focus:ring-primary-container/30 focus:outline-none transition-all duration-200 ${
                      fieldError ? "border-error" : "border-outline-variant"
                    }`}
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>

                {fieldError ? (
                  <p className="text-body-sm text-error">{fieldError}</p>
                ) : (
                  <p className="text-body-sm text-on-surface-variant/70">
                    OTP sẽ được gửi đến email này nếu tài khoản tồn tại.
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <button
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-surface-tint text-on-primary font-headline-sm text-headline-sm py-3 px-4 rounded-[8px] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-primary disabled:active:scale-100"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" />
                      Đang gửi OTP...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">send</span>
                      Gửi mã OTP
                    </>
                  )}
                </button>

                {isSubmitted && (
                  <button
                    className="w-full flex items-center justify-center gap-2 border border-primary/30 bg-primary-container/30 text-primary font-headline-sm text-headline-sm py-3 px-4 rounded-[8px] transition-all duration-200 hover:bg-primary-container/50 active:scale-[0.98]"
                    type="button"
                    onClick={goToResetPassword}
                  >
                    Nhập OTP để đổi mật khẩu
                  </button>
                )}
              </div>
            </form>
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

export default ForgotPasswordPage;