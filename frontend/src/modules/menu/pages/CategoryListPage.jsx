import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/data-display/EmptyState";
import LoadingOverlay from "@/components/feedback/LoadingOverlay";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";
import { useSelector } from "react-redux";
import useCategory from "../hooks/useCategory";
import CategorySearchBar from "../components/CategorySearchBar";
import CategoryTable from "../components/CategoryTable";
import CategoryPagination from "../components/CategoryPagination";
import CategoryFormModal from "../components/CategoryFormModal";

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
    error,
    isEmpty,
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

      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-error/30 bg-error-container/20 text-error text-body-sm">
          <span className="material-symbols-outlined text-[20px] shrink-0">
            error
          </span>
          <div>
            <p className="font-semibold">Không tải được danh sách danh mục</p>
            <p className="mt-1 opacity-90">{error.message}</p>
          </div>
        </div>
      )}

      {!isEmpty && (
        <CategorySearchBar
          value={searchKeyword}
          onChange={handleSearchChange}
        />
      )}

      {isEmpty ? (
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
          <CategoryPagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
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

      <ConfirmDialog
        open={showUnsavedDialog}
        title="Thoát không lưu?"
        description="Bạn có thay đổi chưa lưu. Bạn có chắc muốn thoát?"
        confirmLabel="Thoát"
        cancelLabel="Ở lại"
        variant="warning"
        onConfirm={confirmDiscardChanges}
        onCancel={cancelDiscardChanges}
      />
    </div>
  );
};

export default CategoryListPage;
