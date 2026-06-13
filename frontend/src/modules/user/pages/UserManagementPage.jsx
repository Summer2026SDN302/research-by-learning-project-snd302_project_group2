import ConfirmDialog from "../../../components/feedback/ConfirmDialog";
import LoadingOverlay from "../../../components/feedback/LoadingOverlay";
import PaginationControl from "../../../components/navigation/PaginationControl";
import PageHeader from "../../../components/layout/PageHeader";
import {
  USER_ROLE_FILTER_OPTIONS,
  USER_STATUS_OPTIONS,
} from "../constants/userConstants";
import ResetPasswordModal from "../components/ResetPasswordModal";
import UserFormModal from "../components/UserFormModal";
import useUserManager from "../hooks/useUserManager";

const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("vi-VN");
};

const roleClassMap = {
  Admin: "bg-tertiary-container/20 text-tertiary border-tertiary/20",
  Manager: "bg-secondary-container/20 text-secondary border-secondary/20",
  Staff: "bg-primary-container/10 text-primary border-primary/20",
};

const StatCard = ({ icon, label, value, tone = "primary" }) => {
  const toneClass = {
    primary: "bg-primary-container/10 text-primary",
    secondary: "bg-secondary-container/20 text-secondary",
    error: "bg-error-container/20 text-error",
  }[tone];

  return (
    <div className="flex items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-soft">
      <div className={`rounded-lg p-4 ${toneClass}`}>
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>
      <div>
        <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
          {label}
        </p>
        <p className="text-headline-md font-bold text-on-surface">{value}</p>
      </div>
    </div>
  );
};

const StatusPill = ({ active }) => {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        active
          ? "bg-secondary-container/20 text-secondary"
          : "bg-error-container/30 text-error"
      }`}
    >
      {active ? "Đang hoạt động" : "Tạm khóa"}
    </span>
  );
};

const RolePill = ({ role }) => (
  <span
    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
      roleClassMap[role] || "border-outline-variant bg-surface-container-highest text-on-surface-variant"
    }`}
  >
    {role || "—"}
  </span>
);

const UserManagementPage = () => {
  const manager = useUserManager();

  const statusDialogTitle = manager.statusAction?.nextActive
    ? "Mở khóa tài khoản?"
    : "Tạm khóa tài khoản?";

  const statusDialogDescription = manager.statusAction?.nextActive
    ? `Tài khoản ${manager.statusAction?.user?.username || "này"} sẽ có thể đăng nhập lại.`
    : `Tài khoản ${manager.statusAction?.user?.username || "này"} sẽ bị chặn đăng nhập và refresh token hiện có sẽ bị thu hồi.`;

  return (
    <section className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Quản trị hệ thống" }, { label: "Danh sách người dùng" }]}
        title="Quản lý Người dùng"
        subtitle="Quản lý tài khoản Admin, Manager và Staff trong hệ thống StallBox."
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-label-md text-label-md text-on-primary shadow-sm hover:opacity-90"
            onClick={manager.openCreateForm}
          >
            <span className="material-symbols-outlined">add</span>
            Thêm người dùng mới
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard icon="group" label="Tổng số người dùng" value={manager.stats.total} />
        <StatCard icon="person_check" label="Đang hoạt động" value={manager.stats.active} tone="secondary" />
        <StatCard icon="person_off" label="Tài khoản tạm khóa" value={manager.stats.inactive} tone="error" />
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-soft">
        <div className="flex flex-col gap-4 border-b border-outline-variant bg-surface-container-lowest p-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative min-w-[260px] flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-4 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              placeholder="Tìm theo tên, email, username hoặc số điện thoại..."
              value={manager.filters.search}
              onChange={manager.handleSearchChange}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              name="role"
              className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              value={manager.filters.role}
              onChange={manager.handleFilterChange}
            >
              {USER_ROLE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              name="isActive"
              className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              value={manager.filters.isActive}
              onChange={manager.handleFilterChange}
            >
              {USER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-2.5 text-body-sm text-on-surface-variant hover:bg-surface-container"
              onClick={manager.handleResetFilters}
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              Reset
            </button>
          </div>
        </div>

        {manager.usersError && (
          <div className="border-b border-error/20 bg-error-container/40 px-6 py-3 text-body-sm text-on-error-container">
            {manager.usersError}
          </div>
        )}

        <div className="relative overflow-x-auto">
          <LoadingOverlay show={manager.usersLoading} fullPage={false} />

          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="px-6 py-4 text-left font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                  Họ tên & Email
                </th>
                <th className="px-6 py-4 text-left font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-left font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                  Ngày tham gia
                </th>
                <th className="px-6 py-4 text-left font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-outline-variant">
              {!manager.usersLoading && manager.users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-outline">
                        <span className="material-symbols-outlined text-[36px]">group_off</span>
                      </div>
                      <h3 className="text-headline-sm font-bold text-on-surface">Không có người dùng</h3>
                      <p className="mt-2 text-body-sm text-on-surface-variant">
                        Không tìm thấy tài khoản nào phù hợp với bộ lọc hiện tại.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                manager.users.map((user) => {
                  const initials = getInitials(user.fullName || user.username);
                  const canManage = manager.canManageUser(user);

                  return (
                    <tr key={user._id} className="transition-colors hover:bg-surface-container-low">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-label-md font-bold text-on-primary-container">
                            {initials}
                          </div>
                          <div>
                            <p className="font-body-md text-body-md font-semibold text-on-surface">
                              {user.fullName || user.username}
                            </p>
                            <p className="text-body-sm text-on-surface-variant">
                              {user.email}
                            </p>
                            <p className="text-[11px] text-outline">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><RolePill role={user.role} /></td>
                      <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4"><StatusPill active={user.isActive} /></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-lg p-2 text-outline hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() => manager.openEditForm(user)}
                            title="Chỉnh sửa"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-outline hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() => manager.openResetPassword(user)}
                            disabled={!canManage}
                            title="Đặt lại mật khẩu"
                          >
                            <span className="material-symbols-outlined">lock_reset</span>
                          </button>
                          <button
                            type="button"
                            className={`rounded-lg p-2 text-outline disabled:cursor-not-allowed disabled:opacity-40 ${
                              user.isActive
                                ? "hover:bg-error-container/30 hover:text-error"
                                : "hover:bg-secondary-container/30 hover:text-secondary"
                            }`}
                            onClick={() => manager.openStatusAction(user)}
                            disabled={!canManage}
                            title={user.isActive ? "Tạm khóa" : "Mở khóa"}
                          >
                            <span className="material-symbols-outlined">
                              {user.isActive ? "person_off" : "person_check"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-outline-variant bg-surface-container-lowest p-6 md:flex-row md:items-center md:justify-between">
          <p className="text-body-sm text-on-surface-variant">
            Hiển thị trang {manager.pagination.page} / {manager.pagination.totalPages || 1} — Tổng {manager.pagination.total || 0} người dùng
          </p>
          <PaginationControl
            currentPage={manager.pagination.page || 1}
            totalPages={manager.pagination.totalPages || 1}
            onPageChange={manager.handlePageChange}
          />
        </div>
      </div>

      <UserFormModal
        open={manager.isFormOpen}
        mode={manager.formMode}
        formData={manager.formData}
        fieldErrors={manager.fieldErrors}
        isSaving={manager.usersSaving}
        onChange={manager.handleFormChange}
        onSubmit={manager.handleSubmitUser}
        onClose={manager.closeForm}
      />

      <ResetPasswordModal
        user={manager.resetUser}
        formData={manager.resetPasswordForm}
        fieldErrors={manager.resetPasswordErrors}
        isSaving={manager.usersSaving}
        onChange={manager.handleResetPasswordChange}
        onSubmit={manager.submitResetPassword}
        onClose={manager.closeResetPassword}
      />

      <ConfirmDialog
        open={Boolean(manager.statusAction)}
        title={statusDialogTitle}
        description={statusDialogDescription}
        confirmLabel={manager.statusAction?.nextActive ? "Mở khóa" : "Tạm khóa"}
        cancelLabel="Hủy"
        variant={manager.statusAction?.nextActive ? "info" : "danger"}
        isLoading={manager.usersSaving}
        onConfirm={manager.confirmStatusAction}
        onCancel={manager.closeStatusAction}
      />
    </section>
  );
};

export default UserManagementPage;
