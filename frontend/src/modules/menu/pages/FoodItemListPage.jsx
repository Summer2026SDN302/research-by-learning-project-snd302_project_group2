import { useOutletContext } from 'react-router-dom';
import EmptyState from '../../../components/common/EmptyState';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import FoodItemSearchBar from '../components/FoodItemSearchBar';
import FoodItemCategoryFilter from '../components/FoodItemCategoryFilter';
import FoodItemStatusFilter from '../components/FoodItemStatusFilter';
import FoodItemTable from '../components/FoodItemTable';
import FoodItemFormModal from '../components/FoodItemFormModal';
import useFoodItem from '../hooks/useFoodItem';

const FoodItemListPage = () => {
  const { showToast } = useOutletContext() ?? {};

  const {
    items,
    pagination,
    filters,
    selectedItem,
    searchKeyword,
    isLoading,
    isSubmitting,
    listError,
    modalMode,
    deleteTarget,
    deleteError,
    showUnsavedDialog,
    serverFieldErrors,
    categoryOptions,
    categoryOptionsLoading,
    categoryOptionsError,
    emptyMessage,
    handleSearchChange,
    handleCategoryChange,
    handleArchivedFilterChange,
    handlePageChange,
    openCreateModal,
    openEditModal,
    closeModal,
    confirmDiscardChanges,
    cancelDiscardChanges,
    submitForm,
    handleToggleArchive,
    handleDeleteClick,
    cancelDelete,
    confirmDelete,
  } = useFoodItem();

  const hasActiveFilters =
    Boolean(searchKeyword.trim()) || Boolean(filters.categoryId) || filters.isArchived !== '';

  const isEmptyState = !isLoading && !listError && pagination.total === 0 && !hasActiveFilters;

  const handleExportClick = () => {
    showToast?.({ message: 'Tính năng xuất file đang phát triển', type: 'info' });
  };

  return (
    <div className="relative min-h-[400px] space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Quản lý thực đơn</h2>
          <p className="text-body-md text-on-surface-variant mt-2">
            Xem, thêm mới và quản lý danh sách món ăn trong hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-label-md font-semibold hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Xuất File
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-label-md font-semibold hover:bg-primary-container shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Thêm món mới
          </button>
        </div>
      </div>

      {listError && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-error/30 bg-error-container/20 text-error text-body-sm">
          <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
          <div>
            <p className="font-semibold">Không tải được danh sách món ăn</p>
            <p className="mt-1 opacity-90">{listError.message}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <FoodItemSearchBar value={searchKeyword} onChange={handleSearchChange} />

      {/* Filters */}
      <div className="bg-surface rounded-xl p-4 border border-outline-variant shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <FoodItemCategoryFilter
            value={filters.categoryId}
            options={categoryOptions}
            onChange={handleCategoryChange}
            isLoading={categoryOptionsLoading}
            isEmpty={!categoryOptionsLoading && categoryOptions.length === 0}
          />
          <FoodItemStatusFilter
            value={filters.isArchived}
            onChange={handleArchivedFilterChange}
          />
        </div>
        <p className="text-body-sm text-on-surface-variant">
          Hiển thị <span className="font-bold text-on-surface">{pagination.total}</span> món
        </p>
      </div>

      {categoryOptionsError && (
        <p className="text-body-sm text-tertiary -mt-4">{categoryOptionsError}</p>
      )}

      {isEmptyState ? (
        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <EmptyState
            icon="restaurant_menu"
            title="Chưa có món ăn nào"
            message="Tạo món ăn đầu tiên để bắt đầu quản lý thực đơn."
            action={
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-body-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Thêm món mới
              </button>
            }
          />
        </div>
      ) : (
        <FoodItemTable
          items={items}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={openEditModal}
          onDelete={handleDeleteClick}
          onToggleArchive={handleToggleArchive}
        />
      )}

      <LoadingOverlay show={isLoading && items.length === 0} message="Đang tải món ăn..." />

      <FoodItemFormModal
        open={modalMode !== null}
        mode={modalMode}
        foodItem={selectedItem}
        categoryOptions={categoryOptions}
        categoryOptionsLoading={categoryOptionsLoading}
        categoryOptionsError={categoryOptionsError}
        isSubmitting={isSubmitting}
        serverFieldErrors={serverFieldErrors}
        onClose={closeModal}
        onSubmit={submitForm}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa món ăn"
        description={
          deleteError ??
          `Bạn có chắc muốn xóa món ăn "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={isSubmitting}
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

export default FoodItemListPage;
