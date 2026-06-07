import PageHeader from "../../../components/common/PageHeader";
import EmptyState from "../../../components/common/EmptyState";
import LoadingOverlay from "../../../components/common/LoadingOverlay";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import useCategory from "../hooks/useCategory";
import CategorySearchBar from "../components/CategorySearchBar";
import CategoryTable, { CategoryPagination } from "../components/CategoryTable";
import CategoryFormModal from "../components/CategoryFormModal";

const CategoryListPage = () => {
  const {
    categories,
    pagination,
    isLoading,
    isMutating,
    searchKeyword,
    modalMode,
    selectedCategory,
    deleteTarget,
    deleteError,
    showUnsavedDialog,
    serverFieldError,
    error,
    handleSearchChange,
    handlePageChange,
    openCreateModal,
    openEditModal,
    closeModal,
    confirmDiscardChanges,
    cancelDiscardChanges,
    submitForm,
    handleToggleStatus,
    handleDeleteClick,
    cancelDelete,
    confirmDelete,
  } = useCategory();

  const isEmpty =
    !isLoading && !error && pagination.total === 0 && !searchKeyword.trim();

  const emptyMessage = searchKeyword.trim()
    ? "Không tìm thấy danh mục phù hợp."
    : "Chưa có danh mục nào.";

  return (
    <div className="relative min-h-[400px]">
      <PageHeader
        title="Quản lý danh mục"
        subtitle="Thêm, sửa, xóa và quản lý danh mục thực đơn (Món chính, Đồ uống, Món kèm, v.v.)."
        action={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-body-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Thêm danh mục
          </button>
        }
      />

      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-error/30 bg-error-container/20 text-error text-body-sm">
          <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
          <div>
            <p className="font-semibold">Không tải được danh sách danh mục</p>
            <p className="mt-1 opacity-90">{error.message}</p>
          </div>
        </div>
      )}

      {!isEmpty && (
        <CategorySearchBar value={searchKeyword} onChange={handleSearchChange} />
      )}

      {isEmpty ? (
        <div className="card">
          <EmptyState
            icon="category"
            title="Chưa có danh mục nào"
            message="Tạo danh mục đầu tiên để bắt đầu quản lý thực đơn."
            action={
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-body-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Thêm danh mục
              </button>
            }
          />
        </div>
      ) : (
        <>
          <CategoryTable
            categories={categories}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
            onEdit={openEditModal}
            onDelete={handleDeleteClick}
            onToggleStatus={handleToggleStatus}
          />
          <CategoryPagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}

      <LoadingOverlay show={isLoading && categories.length === 0} message="Đang tải danh mục..." />

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
        open={Boolean(deleteTarget)}
        title="Xóa danh mục"
        description={
          deleteError ??
          `Bạn có chắc muốn xóa danh mục "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={isMutating}
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
