import useDailyMenu from "../hooks/daily-menu/useDailyMenu";
import useDailyMenuItem from "../hooks/daily-menu/useDailyMenuItem";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import ConfirmDialog from "../../../components/feedback/ConfirmDialog";
import PageHeader from "../../../components/layout/PageHeader";
import DailyMenuStats from "../components/daily-menu/DailyMenuStats";
import DailyMenuToolbar from "../components/daily-menu/DailyMenuToolbar";
import DailyMenuTable from "../components/daily-menu/DailyMenuTable";
import UpdateItemModal from "../components/daily-menu/UpdateItemModal";
import PriceHistoryModal from "../components/daily-menu/PriceHistoryModal";
import AddFoodItemModal from "../components/daily-menu/AddFoodItemModal";
import GenerateMenuModal from "../components/daily-menu/GenerateMenuModal";
import ExportInventoryModal from "../components/daily-menu/ExportInventoryModal";
import Spinner from "../../../components/feedback/Spinner";
import { useState } from "react";
import toast from "react-hot-toast";
import * as api from "../api/dailyMenuApi";
import { downloadBlob } from "../../analytics/utils/downloadBlob";

/**
 * DailyMenuPage
 *
 * Main page for managing the daily menu.
 * Composes toolbar, stats, table, and modals.
 * ALL business logic lives in useDailyMenu + useDailyMenuItem hooks.
 */
const DailyMenuPage = () => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleExport = async (type) => {
    try {
      const response = await api.exportInventory(selectedDate, type);
      const filename = `inventory-report-${type}-${dayjs(selectedDate).format("YYYY-MM-DD")}.xlsx`;
      downloadBlob(response, filename);
      toast.success("Xuất báo cáo thành công");
    } catch {
      toast.error("Xuất báo cáo thất bại");
    }
  };

  const {
    menu,
    isLoading,
    selectedDate,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    paginatedItems,
    stats,
    handleDateChange,
    handleSearch,
    handleFilterChange,
    handleResetFilters,
    handlePageChange,
    handleGenerate,
  } = useDailyMenu();

  const {
    isMutating,
    updateModal,
    priceHistoryModal,
    addItemModal,
    generateModal,
    confirmRemove,
    confirmPublish,
    isConfigured,
    handleUpdateItem,
    handleAddFoodItem,
    handleRemoveItem,
    handlePublish,
    openUpdate,
    closeUpdate,
    openPriceHistory,
    closePriceHistory,
    openAddItem,
    closeAddItem,
    openGenerate,
    closeGenerate,
    openConfirmRemove,
    closeConfirmRemove,
    openConfirmPublish,
    closeConfirmPublish,
  } = useDailyMenuItem();

  const userRole = useSelector((s) => s.auth.user?.role);
  const isAdmin = userRole === "Admin";
  const hasMenu = !!menu;
  const menuId = menu?._id;

  const isToday = !dayjs(selectedDate).isBefore(dayjs().startOf("day"));

  // IDs of food items already in today's menu (for AddFoodItemModal)
  const existingItemIds = (menu?.items ?? [])
    .map((i) => i.foodItemId?._id)
    .filter(Boolean);

  const isAllPreparedQtySet =
    (menu?.items ?? []).length > 0 &&
    (menu?.items ?? []).every(
      (item) => item.preparedQuantity && item.preparedQuantity > 0,
    );

  return (
    <section className="space-y-6">
      {/* Page header */}
      <PageHeader
        breadcrumbs={[
          { label: "Quản lý thực đơn" },
          { label: "Thực đơn ngày" },
        ]}
        title="Thực đơn ngày"
        subtitle="Quản lý thực đơn, số lượng và giá món ăn theo ngày."
        action={
          hasMenu ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-5 py-3 font-label-md text-label-md text-on-surface shadow-sm hover:bg-surface-container transition-colors disabled:opacity-50"
                onClick={() => setIsExportModalOpen(true)}
                disabled={isLoading}
              >
                <span className="material-symbols-outlined">download</span>
                Xuất báo cáo kho
              </button>
              {isToday && (
                <>
                  {!isConfigured && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-label-md text-label-md text-on-primary shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={openConfirmPublish}
                      disabled={isMutating || !isAllPreparedQtySet}
                    >
                      <span className="material-symbols-outlined">publish</span>
                      Công bố thực đơn
                    </button>
                  )}
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/25 px-5 py-3 font-label-md text-label-md text-primary hover:bg-primary/20 shadow-sm transition-colors"
                    onClick={openAddItem}
                    disabled={isLoading || isMutating}
                  >
                    <span className="material-symbols-outlined">
                      add_circle
                    </span>
                    Thêm món
                  </button>
                </>
              )}
            </div>
          ) : null
        }
      />

      {/* Statistics */}
      <DailyMenuStats stats={stats} />

      {/* Toolbar + Table card */}
      <div className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-soft">
        {/* Toolbar: Date + Search + Filter */}
        <DailyMenuToolbar
          date={selectedDate}
          onDateChange={handleDateChange}
          searchTerm={searchTerm}
          onSearch={handleSearch}
          statusFilter={statusFilter}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          hasMenu={hasMenu}
          isLoading={isLoading}
        />

        {/* Table or Empty state */}
        {hasMenu ? (
          <DailyMenuTable
            items={paginatedItems}
            isLoading={isLoading}
            onEdit={openUpdate}
            onViewHistory={openPriceHistory}
            onRemove={openConfirmRemove}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={menu?.items?.length ?? 0}
            onPageChange={handlePageChange}
            isToday={isToday}
          />
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner size="lg" />
            <p className="text-body-sm text-on-surface-variant">
              Đang tải thực đơn...
            </p>
          </div>
        ) : (
          !isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="material-symbols-outlined text-[64px] text-outline/40 mb-4">
                restaurant
              </span>
              <p className="text-headline-sm font-bold text-on-surface mb-2">
                Chưa có thực đơn
              </p>
              <p className="text-body-sm text-on-surface-variant mb-6 text-center max-w-sm">
                Thực đơn ngày <strong>{selectedDate}</strong> chưa được tạo.
                Nhấn &quot;Tạo thực đơn&quot; để tạo từ lịch thực đơn.
              </p>
              <button
                onClick={openGenerate}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-label-md text-label-md text-on-primary shadow-sm hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined">auto_awesome</span>
                Tạo thực đơn
              </button>
            </div>
          )
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────────── */}

      {/* Update Item */}
      <UpdateItemModal
        open={updateModal.open}
        item={updateModal.item}
        onSubmit={(payload) =>
          handleUpdateItem(menuId, updateModal.item?.foodItemId?._id, payload)
        }
        onClose={closeUpdate}
        isLoading={isMutating}
      />

      {/* Price History */}
      <PriceHistoryModal
        open={priceHistoryModal.open}
        item={priceHistoryModal.item}
        onClose={closePriceHistory}
        isAdmin={isAdmin}
      />

      {/* Add Food Item */}
      {addItemModal && (
        <AddFoodItemModal
          open={addItemModal}
          onAdd={(foodItemId) => handleAddFoodItem(menuId, foodItemId)}
          onClose={closeAddItem}
          isLoading={isMutating}
          existingItemIds={existingItemIds}
        />
      )}

      {/* Generate Menu */}
      {generateModal && (
        <GenerateMenuModal
          open={generateModal}
          defaultDate={selectedDate}
          onGenerate={(date) => {
            handleGenerate(date);
            closeGenerate();
          }}
          onClose={closeGenerate}
          isLoading={isLoading}
        />
      )}

      {/* Confirm Remove */}
      <ConfirmDialog
        open={confirmRemove.open}
        title="Xóa món ăn"
        description={`Bạn có chắc muốn xóa "${confirmRemove.item?.foodItemId?.name ?? ""}" khỏi thực đơn ngày?`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={() =>
          handleRemoveItem(menuId, confirmRemove.item?.foodItemId?._id)
        }
        onCancel={closeConfirmRemove}
        isLoading={isMutating}
      />

      {/* Confirm Publish */}
      <ConfirmDialog
        open={confirmPublish.open}
        title="Công bố thực đơn"
        description="Bạn có chắc chắn muốn công bố thực đơn này? Sau khi công bố, nhân viên có thể xem thực đơn này và bắt đầu xử lí đơn."
        confirmLabel="Công bố"
        cancelLabel="Hủy"
        variant="info"
        onConfirm={() => handlePublish(menuId)}
        onCancel={closeConfirmPublish}
        isLoading={isMutating}
      />

      {/* Export Inventory Modal */}
      <ExportInventoryModal
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />
    </section>
  );
};

export default DailyMenuPage;
