import { Link } from "react-router-dom";

import useForgotPassword from "../hooks/useForgotPassword";

const ForgotPasswordPage = () => {
  const {
    identifier,
    icon,
    fieldError,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForgotPassword();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 dotted-auth-bg">
      <main className="w-full max-w-[448px] bg-white rounded-2xl border border-outline-variant ambient-shadow overflow-hidden relative">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-primary-fixed" />

        <div className="px-8 pt-10 pb-12 flex flex-col items-center">
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined text-[28px]">
                point_of_sale
              </span>
            </div>
            <h2 className="font-headline-sm text-headline-sm font-black text-primary tracking-tight">
              StallBox
            </h2>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-3">
              Quên mật khẩu
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-[320px] mx-auto">
              Nhập mã nhân viên hoặc email đăng ký để nhận liên kết đặt lại mật
              khẩu.
            </p>
          </div>

          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                className="font-label-md text-label-md text-on-surface-variant ml-1"
                htmlFor="identifier"
              >
                Email hoặc Mã nhân viên
              </label>

              <div className="relative group soft-glow-focus rounded-lg transition-all duration-200">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary">
                  <span className="material-symbols-outlined text-[20px]">
                    {icon}
                  </span>
                </div>

                <input
                  className={`block w-full pl-11 pr-4 py-3.5 bg-surface-container-lowest border rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-0 transition-all ${
                    fieldError ? "border-error" : "border-outline-variant"
                  }`}
                  id="identifier"
                  name="identifier"
                  placeholder="username@stallbox.com"
                  type="text"
                  value={identifier}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
              </div>

              {fieldError ? (
                <p className="text-body-sm text-error">{fieldError}</p>
              ) : (
                <p className="text-body-sm text-on-surface-variant/70">
                  Nhập email hoặc mã nhân viên đã được cấp trong hệ thống.
                </p>
              )}
            </div>

            <button
              className="w-full bg-primary text-on-primary font-headline-sm text-headline-sm py-4 rounded-lg hover:bg-primary-container transition-all duration-300 transform active:scale-[0.98] ambient-shadow flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
              type="submit"
              disabled={isLoading}
            >
              Gửi yêu cầu đặt lại
            </button>
          </form>

          <div className="mt-10 flex flex-col items-center gap-6 w-full">
            <Link
              className="flex items-center gap-2 font-label-md text-label-md text-primary hover:text-primary-container transition-colors group"
              to="/login"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              Quay lại Đăng nhập
            </Link>

            <div className="w-full h-px bg-outline-variant opacity-50" />

            <p className="font-label-md text-label-md text-outline">
              © 2024 StallBox Canteen Manager.
            </p>
          </div>
        </div>

        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary-fixed/10 rounded-full blur-3xl" />
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
