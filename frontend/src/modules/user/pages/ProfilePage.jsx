import LoadingOverlay from "../../../components/feedback/LoadingOverlay";
import Spinner from "../../../components/feedback/Spinner";
import PageHeader from "../../../components/layout/PageHeader";
import useProfile from "../hooks/useProfile";

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:bg-surface-container-low disabled:text-on-surface-variant";

const FieldError = ({ message, helper }) => {
  if (message) return <p className="mt-1 text-body-sm text-error">{message}</p>;
  if (helper) return <p className="mt-1 text-body-sm text-on-surface-variant/70">{helper}</p>;
  return null;
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
      {label}
    </p>
    <p className="mt-1 text-body-md font-semibold text-on-surface">{value || "—"}</p>
  </div>
);

const ProfilePage = () => {
  const {
    user,
    formData,
    fieldErrors,
    error,
    isLoading,
    isSaving,
    handleChange,
    handleSubmit,
  } = useProfile();

  return (
    <section className="relative space-y-6">
      <LoadingOverlay show={isLoading} fullPage={false} />

      <PageHeader
        breadcrumbs={[{ label: "Tài khoản" }, { label: "Hồ sơ cá nhân" }]}
        title="Hồ sơ cá nhân"
        subtitle="Xem và cập nhật thông tin tài khoản đang đăng nhập."
      />

      {error && (
        <div className="rounded-lg border border-error/20 bg-error-container/40 px-4 py-3 text-body-sm text-on-error-container">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-soft">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-container text-headline-md font-black text-on-primary-container">
              {user.initials}
            </div>
            <h2 className="mt-4 text-headline-sm font-bold text-on-surface">
              {user.displayName}
            </h2>
            <p className="text-body-sm text-on-surface-variant">{user.email}</p>

            <span className="mt-4 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-label-md text-label-md text-primary">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              {user.role || "—"}
            </span>
          </div>

          <div className="mt-8 space-y-5 border-t border-outline-variant pt-6">
            <InfoItem label="Tên đăng nhập" value={user.username} />
            <InfoItem label="Trạng thái" value={user.statusLabel} />
            <InfoItem
              label="Ngày tạo"
              value={user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "—"}
            />
          </div>
        </aside>

        <form
          className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-soft"
          onSubmit={handleSubmit}
        >
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-outline-variant pb-5">
            <div>
              <p className="font-label-md text-label-md uppercase tracking-wider text-primary">
                Thông tin liên hệ
              </p>
              <h3 className="mt-1 text-headline-sm font-bold text-on-surface">
                Cập nhật hồ sơ
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block font-label-md text-label-md text-on-surface-variant" htmlFor="fullName">
                Họ tên
              </label>
              <input
                id="fullName"
                name="fullName"
                className={inputClass}
                value={formData.fullName}
                onChange={handleChange}
                disabled={isSaving}
                autoComplete="name"
              />
              <FieldError message={fieldErrors.fullName} helper="Nhập họ tên hiển thị trong hệ thống, tối đa 120 ký tự." />
            </div>

            <div>
              <label className="mb-1 block font-label-md text-label-md text-on-surface-variant" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                className={inputClass}
                value={formData.email}
                onChange={handleChange}
                disabled={isSaving}
                autoComplete="email"
              />
              <FieldError message={fieldErrors.email} helper="Email dùng để liên hệ và khôi phục tài khoản." />
            </div>

            <div>
              <label className="mb-1 block font-label-md text-label-md text-on-surface-variant" htmlFor="phone">
                Số điện thoại
              </label>
              <input
                id="phone"
                name="phone"
                className={inputClass}
                value={formData.phone}
                onChange={handleChange}
                disabled={isSaving}
                autoComplete="tel"
                placeholder="Tùy chọn"
              />
              <FieldError message={fieldErrors.phone} helper="Tùy chọn. Có thể nhập số điện thoại kèm mã vùng." />
            </div>

            <div>
              <label className="mb-1 block font-label-md text-label-md text-on-surface-variant" htmlFor="username-readonly">
                Tên đăng nhập
              </label>
              <input
                id="username-readonly"
                className={inputClass}
                value={user.username || ""}
                disabled
                readOnly
              />
            </div>

            <div>
              <label className="mb-1 block font-label-md text-label-md text-on-surface-variant" htmlFor="role-readonly">
                Vai trò
              </label>
              <input
                id="role-readonly"
                className={inputClass}
                value={user.role || ""}
                disabled
                readOnly
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-outline-variant pt-5">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-label-md text-label-md text-on-primary shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving && <Spinner size="sm" />}
              Lưu hồ sơ
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ProfilePage;
