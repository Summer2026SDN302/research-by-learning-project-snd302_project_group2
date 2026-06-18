import { createPortal } from "react-dom";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/data-display/EmptyState";
import LoadingOverlay from "@/components/feedback/LoadingOverlay";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";
import { useSelector } from "react-redux";
import SearchBar from "@/components/search/SearchBar";
import PaginationControl from "@/components/navigation/PaginationControl";
import FilterBar from "@/components/search/FilterBar";
import useCategory from "../hooks/category/useCategory";
import CategoryTable from "../components/category/CategoryTable";
import CategoryFormModal from "../components/category/CategoryFormModal";

const CategoryListPage = () => {
  const user = useSelector((state) => state.auth.user);
  const currentRole = String(user?.role ?? "").toLowerCase();
  const isAdmin = currentRole === "admin";
  const roleLabel = isAdmin ? "Admin" : "Manager";
  const {
    categories,
    pagination,
    isLoading,
    isMutating,
    searchKeyword,
    modalMode,
    selectedCategory,
    showUnsavedDialog,
    serverFieldError,
    errorMsg,
    errorTitle,
    isEmptyState,
    filterBarConfig,
    filterValues,
    handleFilterChange,
    handleFilterReset,
    emptyTitle,
    emptyMessage,
    handleSearchChange,
    handlePageChange,
    openCreateModal,
    openEditModal,
    closeModal,
    confirmDiscardChanges,
    cancelDiscardChanges,
    submitForm,
    handleToggleStatus,
    statusConfirmTarget,
    handleConfirmToggleStatus,
    handleCancelToggleStatus,
  } = useCategory();

  return (
    <div className="relative min-h-[400px]">
      <PageHeader
        breadcrumbs={[{ label: roleLabel }, { label: "Danh mục món ăn" }]}
        title={isAdmin ? "Quản lý danh mục" : "Danh sách danh mục"}
        subtitle={
          isAdmin
            ? "Phân loại theo loại món: cơm, phở–bún–mì, canh, món kèm, đồ uống, ăn vặt..."
            : "Xem danh sách danh mục món ăn trong hệ thống."
        }
        action={
          isAdmin ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-body-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Thêm danh mục
            </button>
          ) : null
        }
      />

      {errorMsg && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-error/30 bg-error-container/20 text-error text-body-sm">
          <span className="material-symbols-outlined text-[20px] shrink-0">
            error
          </span>
          <div>
            <p className="font-semibold">{errorTitle}</p>
            <p className="mt-1 opacity-90">{errorMsg}</p>
          </div>
        </div>
      )}

      {!isEmptyState && (
        <div className="w-full max-w-md mb-6">
          <SearchBar
            placeholder="Tìm kiếm danh mục..."
            value={searchKeyword}
            onChange={handleSearchChange}
          />
        </div>
      )}

      {!isEmptyState && (
        <div className="bg-surface rounded-xl p-4 mb-6 border border-outline-variant shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <FilterBar
            filters={filterBarConfig}
            values={filterValues}
            onChange={handleFilterChange}
            onReset={handleFilterReset}
          />
          <p className="text-body-sm text-on-surface-variant">
            Hiển thị{" "}
            <span className="font-bold text-on-surface">
              {pagination.total}
            </span>{" "}
            danh mục
          </p>
        </div>
      )}

      {isEmptyState ? (
        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <EmptyState
            icon="category"
            title="Chưa có danh mục nào"
            message="Tạo danh mục đầu tiên để bắt đầu quản lý thực đơn."
            action={
              isAdmin ? (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-body-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    add
                  </span>
                  Thêm danh mục
                </button>
              ) : null
            }
          />
        </div>
      ) : (
        <>
          <CategoryTable
            categories={categories}
            isLoading={isLoading}
            emptyTitle={emptyTitle}
            emptyMessage={emptyMessage}
            onEdit={openEditModal}
            onToggleStatus={handleToggleStatus}
            canManageActions={isAdmin}
          />
          {pagination.total > 0 && (
            <div className="mt-4 px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-3 text-body-sm">
              <span className="text-on-surface-variant">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                trên {pagination.total} danh mục
              </span>
              <PaginationControl
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      <LoadingOverlay
        show={isLoading && categories.length === 0}
        message="Đang tải danh mục..."
      />

      <CategoryFormModal
        open={modalMode !== null}
        mode={modalMode}
        category={selectedCategory}
        isSubmitting={isMutating}
        serverFieldError={serverFieldError}
        onClose={closeModal}
        onSubmit={submitForm}
      />

      {createPortal(
        <ConfirmDialog
          open={showUnsavedDialog}
          title="Thoát không lưu?"
          description="Bạn có thay đổi chưa lưu. Bạn có chắc muốn thoát?"
          confirmLabel="Thoát"
          cancelLabel="Ở lại"
          variant="warning"
          onConfirm={confirmDiscardChanges}
          onCancel={cancelDiscardChanges}
        />,
        document.body
      )}

      {createPortal(
        <ConfirmDialog
          open={Boolean(statusConfirmTarget)}
          title={
            statusConfirmTarget?.isActive
              ? "Vô hiệu hóa danh mục?"
              : "Kích hoạt danh mục?"
          }
          description={
            statusConfirmTarget?.isActive
              ? `Bạn có chắc chắn muốn vô hiệu hóa danh mục "${statusConfirmTarget?.name}"?`
              : `Bạn có chắc chắn muốn kích hoạt danh mục "${statusConfirmTarget?.name}"?`
          }
          confirmLabel="Xác nhận"
          cancelLabel="Hủy"
          variant={statusConfirmTarget?.isActive ? "danger" : "info"}
          onConfirm={handleConfirmToggleStatus}
          onCancel={handleCancelToggleStatus}
        />,
        document.body
      )}
    </div>
  );
};

export default CategoryListPage;
