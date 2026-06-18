import Spinner from "../../../components/feedback/Spinner";
import { USER_ROLE_OPTIONS } from "../constants/userConstants";

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

const FieldError = ({ message, helper }) => {
  if (message) return <p className="mt-1 text-body-sm text-error">{message}</p>;
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
}) => {
  if (!open) return null;

  const isCreate = mode === "create";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <section className="relative w-full max-w-2xl rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-elevated">
        <div className="flex items-start justify-between border-b border-outline-variant px-6 py-5">
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
            className="rounded-full p-2 text-outline hover:bg-surface-container hover:text-on-surface disabled:opacity-50"
            disabled={isSaving}
            onClick={onClose}
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="space-y-5 px-6 py-6" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label
                className="mb-1 block font-label-md text-label-md text-on-surface-variant"
                htmlFor="username"
              >
                Tên đăng nhập
              </label>
              <input
                id="username"
                name="username"
                className={inputClass}
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
                className="mb-1 block font-label-md text-label-md text-on-surface-variant"
                htmlFor="role"
              >
                Vai trò
              </label>
              <select
                id="role"
                name="role"
                className={inputClass}
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
              <FieldError
                message={fieldErrors.role}
                helper="Chọn quyền phù hợp với tài khoản này."
              />
            </div>

            {isCreate && (
              <div className="md:col-span-2">
                <label
                  className="mb-1 block font-label-md text-label-md text-on-surface-variant"
                  htmlFor="password"
                >
                  Mật khẩu tạm thời
                </label>
                <input
                  id="password"
                  name="password"
                  className={inputClass}
                  type="password"
                  value={formData.password}
                  onChange={onChange}
                  autoComplete="new-password"
                  disabled={isSaving}
                  placeholder="Ít nhất 6 ký tự"
                />
                <FieldError
                  message={fieldErrors.password}
                  helper="Ít nhất 6 ký tự và không được chỉ gồm khoảng trắng."
                />
              </div>
            )}

            <div>
              <label
                className="mb-1 block font-label-md text-label-md text-on-surface-variant"
                htmlFor="fullName"
              >
                Họ tên
              </label>
              <input
                id="fullName"
                name="fullName"
                className={inputClass}
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
                className="mb-1 block font-label-md text-label-md text-on-surface-variant"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                className={inputClass}
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
                className="mb-1 block font-label-md text-label-md text-on-surface-variant"
                htmlFor="phone"
              >
                Số điện thoại
              </label>
              <input
                id="phone"
                name="phone"
                className={inputClass}
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
              {isCreate ? "Tạo người dùng" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default UserFormModal;
