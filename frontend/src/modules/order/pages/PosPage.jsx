import { useStaffPos } from "../hooks/useStaffPos";
import CategoryFilterBar from "../components/CategoryFilterBar";
import PosMenuGrid from "../components/PosMenuGrid";
import OrderSummaryCard from "../components/OrderSummaryCard";
import Spinner from "@/components/feedback/Spinner";
import EmptyState from "@/components/data-display/EmptyState";
import SearchBar from "@/components/search/SearchBar";

const PosPage = ({ role = "staff" }) => {
  const staffPos = useStaffPos();

  const {
    todayMenu,
    categories,
    loadingMenu,
    menuError,
    selectedCategoryId,
    setSelectedCategoryId,
    searchQuery,
    setSearchQuery,
    filteredMenuItems,
    cart,
    cartTotals,
    orderNotes,
    handleOrderNotesChange,
    handleAddItem,
    handleRemoveItem,
    handleUpdateQuantity,
    handleUpdateNote,
    handleClearCart,
    handleSubmitOrder,
    submitStatus,
    refetchMenu,
  } = staffPos;

  const handleCheckoutClick = () => {
    void handleSubmitOrder();
  };

  if (loadingMenu) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3 select-none">
        <Spinner size="lg" />
        <p className="text-body-sm text-on-surface-variant font-medium">
          Đang tải thông tin thực đơn hôm nay...
        </p>
      </div>
    );
  }

  if (menuError) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-4">
        <EmptyState
          icon="error"
          title="Không thể tải thực đơn"
          message={`${menuError} Vui lòng nhấn nút thử lại bên dưới.`}
          action={
            <button
              type="button"
              onClick={() => void refetchMenu()}
              className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-xl shadow hover:opacity-90 transition-opacity"
            >
              Tải lại trang
            </button>
          }
        />
      </div>
    );
  }

  if (!todayMenu || !todayMenu.items || todayMenu.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-4">
        <EmptyState
          icon="restaurant"
          title="Chưa có thực đơn hôm nay"
          message={
            role === "manager"
              ? "Thực đơn ngày hôm nay chưa được thiết lập hoặc công bố. Vui lòng nhấn tạo thực đơn trong trang quản lý thực đơn ngày."
              : "Thực đơn ngày hôm nay chưa được Manager/Admin thiết lập hoặc công bố. Vui lòng quay lại sau hoặc liên hệ quản lý để tạo thực đơn."
          }
        />
      </div>
    );
  }

  return (
    <section className="h-full">
      <div className="grid grid-cols-12 gap-6 h-full items-start">
        {/* LEFT COLUMN: Title, Search, Categories & Menu Grid (8 cols) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          {/* Search Bar under Title */}
          <div className="w-full">
            <SearchBar
              placeholder="Tìm món ăn nhanh..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-full"
            />
          </div>

          {/* Horizontal Category Filtering */}
          <CategoryFilterBar
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />

          {/* Menu Grid */}
          <PosMenuGrid items={filteredMenuItems} onAddItem={handleAddItem} />
        </div>

        {/* RIGHT COLUMN: Order Summary (4 cols) */}
        <div className="col-span-12 lg:col-span-4 lg:h-[calc(100vh-120px)]">
          <OrderSummaryCard
            cart={cart}
            totals={cartTotals}
            orderNotes={orderNotes}
            onOrderNotesChange={handleOrderNotesChange}
            onUpdateQuantity={handleUpdateQuantity}
            onUpdateNote={handleUpdateNote}
            onRemove={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckout={handleCheckoutClick}
            isSubmitting={submitStatus === "loading"}
          />
        </div>
      </div>
    </section>
  );
};

export default PosPage;
