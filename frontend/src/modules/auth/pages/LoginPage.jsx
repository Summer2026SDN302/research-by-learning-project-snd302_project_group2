import { Link } from "react-router-dom";

import PasswordInput from "../../../components/form/PasswordInput";
import Spinner from "../../../components/feedback/Spinner";
import useLogin from "../hooks/useLogin";

const loginInputClass =
  "w-full pl-11 pr-4 py-3 bg-surface rounded-lg border text-on-surface font-body-md text-body-md placeholder-on-surface-variant/50 focus:border-primary focus:ring-[3px] focus:ring-primary-container/30 focus:outline-none transition-all duration-200";

const LoginPage = () => {
  const {
    formData,
    fieldErrors,
    formError,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useLogin();

  return (
    <div className="bg-background min-h-screen flex items-center justify-center relative overflow-hidden tech-bg text-on-background px-4">
      <div className="absolute inset-0 grid-overlay pointer-events-none" />

      <div className="w-full max-w-[440px] md:px-0 z-10 relative">
        <div className="bg-surface-container-lowest rounded-[16px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),_0_8px_10px_-6px_rgba(0,0,0,0.01)] border border-outline-variant/30 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-primary-fixed" />

          <div className="p-8">
            <div className="text-center mb-10">
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
                Truy cập hệ thống quản lý căn tin
              </p>
            </div>

            {formError && (
              <div className="mb-5 rounded-lg border border-error/20 bg-error-container/40 px-4 py-3 text-body-sm text-on-error-container">
                {formError}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  className="block font-label-md text-label-md text-on-surface uppercase tracking-wider"
                  htmlFor="identifier"
                >
                  Tên đăng nhập
                </label>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">
                    person
                  </span>

                  <input
                    className={`${loginInputClass} ${
                      fieldErrors.identifier
                        ? "border-error"
                        : "border-outline-variant"
                    }`}
                    id="identifier"
                    name="identifier"
                    placeholder="Nhập mã nhân viên hoặc email"
                    type="text"
                    value={formData.identifier}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </div>

                {fieldErrors.identifier ? (
                  <p className="text-body-sm text-error">
                    {fieldErrors.identifier}
                  </p>
                ) : (
                  <p className="text-body-sm text-on-surface-variant/70">
                    Có thể dùng tên đăng nhập hoặc email đã được cấp.
                  </p>
                )}
              </div>

              <PasswordInput
                id="password"
                name="password"
                label="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={fieldErrors.password}
                helper="Mật khẩu phân biệt chữ hoa/thường, không nhập toàn khoảng trắng."
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                leftIcon="lock"
                inputClassName={loginInputClass}
                labelClassName="block font-label-md text-label-md text-on-surface uppercase tracking-wider"
                wrapperClassName="space-y-2"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input
                    className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary-container bg-surface cursor-pointer transition-colors"
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <label
                    className="ml-2 block font-body-sm text-body-sm text-on-surface-variant cursor-pointer"
                    htmlFor="rememberMe"
                  >
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <Link
                  className="font-body-sm text-body-sm text-primary hover:text-surface-tint font-semibold transition-colors"
                  to="/forgot-password"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <div className="pt-4">
                <button
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-surface-tint text-on-primary font-headline-sm text-headline-sm py-3 px-4 rounded-[8px] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-primary disabled:active:scale-100"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    <>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        login
                      </span>
                      Đăng nhập
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-surface-container-low py-4 px-8 border-t border-outline-variant/20 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-outline text-sm">
              encrypted
            </span>
            <span className="font-label-md text-label-md text-outline">
              Kết nối an toàn &amp; mã hóa
            </span>
          </div>
        </div>

        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-primary/10 blur-xl rounded-full pointer-events-none -z-10" />
      </div>
    </div>
  );
};

export default LoginPage;
