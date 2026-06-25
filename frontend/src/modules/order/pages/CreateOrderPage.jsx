import useCreateOrder from "../hooks/useCreateOrder";
import CategoryTabs from "../components/CategoryTabs";
import MenuItemCard from "../components/MenuItemCard";
import OrderSummary from "../components/OrderSummary";
import LoadingOverlay from "../../../components/feedback/LoadingOverlay";
import Spinner from "../../../components/feedback/Spinner";

/**
 * CreateOrderPage (POS)
 *
 * Main POS page for Staff. Two-column layout:
 *   Left  – Menu grid (category tabs + food item cards)
 *   Right – Order summary (cart + pricing + submit)
 *
 * ALL logic lives in useCreateOrder hook. This page ONLY renders UI.
 */
const CreateOrderPage = () => {
  const {
    menuItems,
    isLoadingMenu,
    menuError,
    categories,
    categoryFilter,
    searchTerm,
    handleCategoryChange,
    handleSearch,
    cart,
    cartItemIds,
    cartSubTotal,
    cartTax,
    cartTotal,
    handleAddToCart,
    handleIncreaseQty,
    handleDecreaseQty,
    handleClearCart,
    paymentMethod,
    handlePaymentMethodChange,
    isSubmitting,
    handleSubmitOrder,
  } = useCreateOrder();

  return (
    <div className="flex h-[calc(100vh-73px)] -m-8">
      {/* ── Left: Menu Section ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search bar */}
        <div className="px-6 pt-6 pb-4">
          <div className="relative max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-outline">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Tìm món ăn hoặc mã món..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className="px-6 pb-4">
          <CategoryTabs
            categories={categories}
            active={categoryFilter}
            onChange={handleCategoryChange}
          />
        </div>

        {/* Menu grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 relative">
          {isLoadingMenu && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Spinner size="lg" />
              <p className="text-body-sm text-on-surface-variant">
                Đang tải thực đơn...
              </p>
            </div>
          )}

          {!isLoadingMenu && menuError && (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="material-symbols-outlined text-[64px] text-outline/40 mb-4">
                restaurant
              </span>
              <p className="text-headline-sm font-bold text-on-surface mb-2">
                Không có thực đơn
              </p>
              <p className="text-body-sm text-on-surface-variant text-center max-w-sm">
                {menuError}
              </p>
            </div>
          )}

          {!isLoadingMenu && !menuError && menuItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="material-symbols-outlined text-[64px] text-outline/40 mb-4">
                search_off
              </span>
              <p className="text-headline-sm font-bold text-on-surface mb-2">
                Không tìm thấy món ăn
              </p>
              <p className="text-body-sm text-on-surface-variant">
                Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.
              </p>
            </div>
          )}

          {!isLoadingMenu && !menuError && menuItems.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {menuItems.map((item) => (
                <MenuItemCard
                  key={item.foodItemId?._id ?? item._id}
                  item={item}
                  isSelected={cartItemIds.has(item.foodItemId?._id)}
                  onAdd={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Order Summary ────────────────────────────────────────────── */}
      <OrderSummary
        cart={cart}
        subTotal={cartSubTotal}
        tax={cartTax}
        total={cartTotal}
        paymentMethod={paymentMethod}
        onIncrease={handleIncreaseQty}
        onDecrease={handleDecreaseQty}
        onClear={handleClearCart}
        onPaymentChange={handlePaymentMethodChange}
        onSubmit={handleSubmitOrder}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default CreateOrderPage;
