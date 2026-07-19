import { createPortal } from "react-dom";
import DataTable from "../../../components/data-display/DataTable";
import StatusBadge from "../../../components/data-display/StatusBadge";
import StatisticCard from "../../../components/data-display/StatisticCard";
import ConfirmDialog from "../../../components/feedback/ConfirmDialog";
import PageHeader from "../../../components/layout/PageHeader";
import PaginationControl from "../../../components/navigation/PaginationControl";
import FilterBar from "../../../components/search/FilterBar";
import SearchBar from "../../../components/search/SearchBar";
import {
  USER_ROLE_FILTER_OPTIONS,
  USER_STATUS_OPTIONS,
} from "../constants/userConstants";
import ResetPasswordModal from "../components/ResetPasswordModal";
import UserFormModal from "../components/UserFormModal";
import useUserManager from "../hooks/useUserManager";
import { getInitials } from "../../../utils/formatters";

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("vi-VN");
};

const roleClassMap = {
  Admin: "bg-tertiary-container/20 text-tertiary border-tertiary/20",
  Manager: "bg-secondary-container/20 text-secondary border-secondary/20",
  Staff: "bg-primary-container/10 text-primary border-primary/20",
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

const UserIdentityCell = ({ user }) => {
  const initials = getInitials(user.fullName || user.username);

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-label-md font-bold text-on-primary-container">
        {initials}
      </div>
      <div>
        <p className="font-body-md text-body-md font-semibold text-on-surface">
          {user.fullName || user.username}
        </p>
        <p className="text-body-sm text-on-surface-variant">{user.email}</p>
        <p className="text-[11px] text-outline">@{user.username}</p>
      </div>
    </div>
  );
};

const ActionButtons = ({ user, manager }) => {
  const canManage = manager.canManageUser(user);

  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        className="rounded-lg p-2 text-outline hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 flex items-center justify-center"
        onClick={() => manager.openEditForm(user)}
        title="Chỉnh sửa"
      >
        <span className="material-symbols-outlined">edit</span>
      </button>
      <button
        type="button"
        className="rounded-lg p-2 text-outline hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 flex items-center justify-center"
        onClick={() => manager.openResetPassword(user)}
        disabled={!canManage}
        title="Đặt lại mật khẩu"
      >
        <span className="material-symbols-outlined">lock_reset</span>
      </button>
      <button
        type="button"
        className={`rounded-lg p-2 text-outline disabled:cursor-not-allowed disabled:opacity-40 flex items-center justify-center ${
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
  );
};

const columns = [
  { key: "identity", label: "Họ tên & Email", sortable: false },
  { key: "role", label: "Vai trò", sortable: true },
  { key: "createdAt", label: "Ngày tham gia", sortable: true },
  { key: "isActive", label: "Trạng thái", sortable: true },
  { key: "actions", label: "Thao tác", sortable: false },
];

const UserManagementPage = () => {
  const manager = useUserManager();

  const statusDialogTitle = manager.statusAction?.nextActive
    ? "Mở khóa tài khoản?"
    : "Tạm khóa tài khoản?";

  const statusDialogDescription = manager.statusAction?.nextActive
    ? `Tài khoản ${manager.statusAction?.user?.username || "này"} sẽ có thể đăng nhập lại.`
    : `Tài khoản ${manager.statusAction?.user?.username || "này"} sẽ bị chặn đăng nhập và phiên đăng nhập hiện có sẽ bị thu hồi.`;

  const filterValues = {
    role: manager.filters.role,
    isActive: manager.filters.isActive,
  };

  const userRows = manager.users.map((user) => ({
    ...user,
    id: user._id,
    identity: user.fullName || user.username,
    actions: user._id,
  }));

  const renderCell = (key, value, user) => {
    if (key === "identity") return <UserIdentityCell user={user} />;
    if (key === "role") return <RolePill role={value} />;
    if (key === "createdAt") return <span className="text-on-surface-variant">{formatDate(value)}</span>;
    if (key === "isActive") {
      return (
        <StatusBadge
          status={value ? "active" : "inactive"}
          label={value ? "Đang hoạt động" : "Tạm khóa"}
          size="sm"
        />
      );
    }
    if (key === "actions") return <ActionButtons user={user} manager={manager} />;

    return value || "—";
  };

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
        <StatisticCard icon="group" label="Tổng số người dùng" value={manager.stats.total} />
        <StatisticCard icon="person_check" label="Đang hoạt động" value={manager.stats.active} variant="secondary" />
        <StatisticCard icon="person_off" label="Tài khoản tạm khóa" value={manager.stats.inactive} variant="error" />
      </div>

      <div className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-soft">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <SearchBar
            className="min-w-[260px] flex-1"
            placeholder="Tìm theo tên, email, username hoặc số điện thoại..."
            value={manager.filters.search}
            onChange={(value) => manager.handleSearchChange({ target: { value } })}
            onClear={() => manager.handleSearchChange({ target: { value: "" } })}
          />

          <FilterBar
            filters={[
              { key: "role", label: "Vai trò", options: USER_ROLE_FILTER_OPTIONS },
              { key: "isActive", label: "Trạng thái", options: USER_STATUS_OPTIONS },
            ]}
            values={filterValues}
            onChange={(key, value) => manager.handleFilterChange({ target: { name: key, value } })}
            onReset={manager.handleResetFilters}
          />
        </div>

        {manager.usersError && (
          <div className="rounded-lg border border-error/20 bg-error-container/40 px-4 py-3 text-body-sm text-on-error-container">
            {manager.usersError}
          </div>
        )}

        <DataTable
          columns={columns}
          rows={userRows}
          isLoading={manager.usersLoading}
          emptyTitle="Không có người dùng"
          emptyMessage="Không tìm thấy tài khoản nào phù hợp với bộ lọc hiện tại."
          renderCell={renderCell}
        />

        <div className="flex flex-col gap-4 border-t border-outline-variant pt-5 md:flex-row md:items-center md:justify-between">
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
        error={manager.usersError}
      />

      <ResetPasswordModal
        user={manager.resetUser}
        formData={manager.resetPasswordForm}
        fieldErrors={manager.resetPasswordErrors}
        isSaving={manager.usersSaving}
        onChange={manager.handleResetPasswordChange}
        onSubmit={manager.submitResetPassword}
        onClose={manager.closeResetPassword}
        error={manager.usersError}
      />

      {createPortal(
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
          error={manager.usersError}
        />,
        document.body,
      )}
    </section>
  );
};

export default UserManagementPage;
