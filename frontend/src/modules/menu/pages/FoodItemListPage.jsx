import { createPortal } from "react-dom";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/data-display/EmptyState";
import LoadingOverlay from "@/components/feedback/LoadingOverlay";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";
import FilterBar from "@/components/search/FilterBar";
import { useSelector } from "react-redux";
import SearchBar from "@/components/search/SearchBar";
import PaginationControl from "@/components/navigation/PaginationControl";
import FoodItemTable from "../components/food-item/FoodItemTable";
import FoodItemFormModal from "../components/food-item/FoodItemFormModal";
import useFoodItem from "../hooks/food-item/useFoodItem";
import FoodItemDetailDialog from "../components/food-item/FoodItemDetailDialog";

const FoodItemListPage = () => {
  const user = useSelector((state) => state.auth.user);
  const currentRole = String(user?.role ?? "").toLowerCase();
  const isAdmin = currentRole === "admin";
  const isManager = currentRole === "manager";
  const roleLabel = isAdmin ? "Admin" : "Manager";

  const {
    items,
    pagination,
    selectedItem,
    searchKeyword,
    isLoading,
    isSubmitting,
    errorMsg,
    errorTitle,
    modalMode,
    showUnsavedDialog,
    serverFieldErrors,
    categoryOptions,
    categoryOptionsLoading,
    categoryOptionsError,
    emptyMessage,
    isEmptyState,
    filterBarConfig,
    filterValues,
    handleSearchChange,
    handleFilterChange,
    handleFilterReset,
    handlePageChange,
    openCreateModal,
    openEditModal,
    closeModal,
    confirmDiscardChanges,
    cancelDiscardChanges,
    submitForm,
    handleToggleArchive,
    archiveConfirmTarget,
    handleConfirmToggleArchive,
    handleCancelToggleArchive,
    handleExport,
    detailTarget,
    openDetailDialog,
    closeDetailDialog,
  } = useFoodItem();

  return (
    <div className="relative min-h-[400px] space-y-6">
      <PageHeader
        breadcrumbs={[{ label: roleLabel }, { label: "Món ăn" }]}
        title={isAdmin ? "Quản lý thực đơn" : "Danh sách món ăn"}
        subtitle={
          isAdmin
            ? "Xem, thêm mới và quản lý danh sách món ăn trong hệ thống."
            : "Xem danh sách và thông tin chi tiết món ăn trong hệ thống."
        }
        action={
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-label-md font-semibold hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                download
              </span>
              Xuất File
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-label-md font-semibold hover:bg-primary-container shadow-sm transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                Thêm món mới
              </button>
            )}
          </div>
        }
      />

      {errorMsg && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-error/30 bg-error-container/20 text-error text-body-sm">
          <span className="material-symbols-outlined text-[20px] shrink-0">
            error
          </span>
          <div>
            <p className="font-semibold">{errorTitle}</p>
            <p className="mt-1 opacity-90">{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <SearchBar
          placeholder="Tìm kiếm món ăn..."
          value={searchKeyword}
          onChange={handleSearchChange}
        />
      </div>

      <div className="bg-surface rounded-xl p-4 border border-outline-variant shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <FilterBar
          filters={filterBarConfig}
          values={filterValues}
          onChange={handleFilterChange}
          onReset={handleFilterReset}
        />
        <p className="text-body-sm text-on-surface-variant">
          Hiển thị{" "}
          <span className="font-bold text-on-surface">{pagination.total}</span>{" "}
          món
        </p>
      </div>

      {categoryOptionsError && (
        <p className="text-body-sm text-tertiary -mt-4">
          {categoryOptionsError}
        </p>
      )}

      {categoryOptionsLoading && categoryOptions.length === 0 && (
        <p className="text-body-sm text-on-surface-variant -mt-4">
          Đang tải danh mục...
        </p>
      )}

      {!categoryOptionsLoading &&
        categoryOptions.length === 0 &&
        !categoryOptionsError && (
          <p className="text-body-sm text-on-surface-variant -mt-4">
            Chưa có danh mục
          </p>
        )}

      {isEmptyState ? (
        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <EmptyState
            icon="restaurant_menu"
            title="Chưa có món ăn nào"
            message="Tạo món ăn đầu tiên để bắt đầu quản lý thực đơn."
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
                  Thêm món mới
                </button>
              ) : null
            }
          />
        </div>
      ) : (
        <>
          <FoodItemTable
            items={items}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
            onViewDetail={openDetailDialog}
            onEdit={openEditModal}
            onToggleArchive={handleToggleArchive}
            canViewDetail={isAdmin || isManager}
            canManageActions={isAdmin}
          />
          {pagination && pagination.total > 0 && handlePageChange && (
            <div className="mt-4 px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-3 text-body-sm">
              <span className="text-on-surface-variant">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                trên {pagination.total} món ăn
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
        show={isLoading && items.length === 0}
        message="Đang tải món ăn..."
      />

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

      <FoodItemDetailDialog
        open={Boolean(detailTarget)}
        item={detailTarget}
        onClose={closeDetailDialog}
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
        document.body,
      )}

      {createPortal(
        <ConfirmDialog
          open={Boolean(archiveConfirmTarget)}
          title={
            archiveConfirmTarget?.isArchived
              ? "Mở bán lại món ăn?"
              : "Ngừng bán món ăn?"
          }
          description={
            archiveConfirmTarget?.isArchived
              ? `Bạn có chắc chắn muốn mở bán lại món ăn "${archiveConfirmTarget?.name}"? Món sẽ có thể được thêm lại vào lịch bán và thực đơn.`
              : `Bạn có chắc chắn muốn ngừng bán món ăn "${archiveConfirmTarget?.name}"? Món sẽ bị gỡ khỏi lịch bán định kỳ, không thể thêm vào thực đơn mới và nếu đang có trong thực đơn hôm nay hoặc tương lai thì sẽ được chuyển sang Không khả dụng.`
          }
          confirmLabel={
            archiveConfirmTarget?.isArchived ? "Mở bán lại" : "Ngừng bán"
          }
          cancelLabel="Hủy"
          variant={archiveConfirmTarget?.isArchived ? "info" : "danger"}
          onConfirm={handleConfirmToggleArchive}
          onCancel={handleCancelToggleArchive}
        />,
        document.body,
      )}
    </div>
  );
};

export default FoodItemListPage;
