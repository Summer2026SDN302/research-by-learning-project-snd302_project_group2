import useDailyMenu from "../../hooks/daily-menu/useDailyMenu";
import useDailyMenuItem from "../../hooks/daily-menu/useDailyMenuItem";
import { useSelector } from "react-redux";
import ConfirmDialog from "../../../../components/feedback/ConfirmDialog";
import DailyMenuStats from "../../components/daily-menu/DailyMenuStats";
import DailyMenuToolbar from "../../components/daily-menu/DailyMenuToolbar";
import DailyMenuTable from "../../components/daily-menu/DailyMenuTable";
import UpdateItemModal from "../../components/daily-menu/UpdateItemModal";
import PriceHistoryModal from "../../components/daily-menu/PriceHistoryModal";
import AddFoodItemModal from "../../components/daily-menu/AddFoodItemModal";
import GenerateMenuModal from "../../components/daily-menu/GenerateMenuModal";

/**
 * DailyMenuPage
 *
 * Main page for managing the daily menu.
 * Composes toolbar, stats, table, and modals.
 * ALL business logic lives in useDailyMenu + useDailyMenuItem hooks.
 */
const DailyMenuPage = () => {
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
    handleUpdateItem,
    handleAddFoodItem,
    handleRemoveItem,
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
  } = useDailyMenuItem();

  const userRole = useSelector((s) => s.auth.user?.role);
  const isAdmin = userRole === "admin";

  const hasMenu = !!menu;
  const menuId = menu?._id;

  // IDs of food items already in today's menu (for AddFoodItemModal)
  const existingItemIds = (menu?.items ?? [])
    .map((i) => i.foodItemId?._id)
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-headline-md font-bold text-on-surface">
          Thực đơn ngày
        </h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Quản lý thực đơn, số lượng và giá món ăn theo ngày.
        </p>
      </div>

      {/* Statistics */}
      {hasMenu && <DailyMenuStats stats={stats} />}

      {/* Toolbar */}
      <DailyMenuToolbar
        date={selectedDate}
        onDateChange={handleDateChange}
        searchTerm={searchTerm}
        onSearch={handleSearch}
        statusFilter={statusFilter}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onGenerate={openGenerate}
        onAddItem={openAddItem}
        hasMenu={hasMenu}
        isLoading={isLoading}
      />

      {/* Table */}
      {hasMenu ? (
        <DailyMenuTable
          items={paginatedItems}
          isLoading={isLoading}
          onEdit={openUpdate}
          onViewHistory={openPriceHistory}
          onRemove={openConfirmRemove}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      ) : (
        !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-soft">
            <span className="material-symbols-outlined text-[64px] text-outline/40 mb-4">
              restaurant
            </span>
            <p className="text-headline-sm font-bold text-on-surface mb-2">
              Chưa có thực đơn
            </p>
            <p className="text-body-sm text-on-surface-variant mb-6 text-center max-w-sm">
              Thực đơn ngày <strong>{selectedDate}</strong> chưa được tạo. Nhấn
              "Tạo thực đơn" để tạo từ lịch thực đơn.
            </p>
            <button
              onClick={openGenerate}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary text-on-primary text-body-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">
                auto_awesome
              </span>
              Tạo thực đơn
            </button>
          </div>
        )
      )}

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
      <GenerateMenuModal
        open={generateModal}
        onGenerate={(date) => {
          handleGenerate(date);
          closeGenerate();
        }}
        onClose={closeGenerate}
        isLoading={isLoading}
      />

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
    </div>
  );
};

export default DailyMenuPage;
