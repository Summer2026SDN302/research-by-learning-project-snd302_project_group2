import { useNavigate } from "react-router-dom";
import { useStaffPos } from "../hooks/useStaffPos";
import { usePaymentModal } from "@/modules/payment/hooks/usePaymentModal";
import CategoryFilterBar from "../components/CategoryFilterBar";
import PosMenuGrid from "../components/PosMenuGrid";
import OrderSummaryCard from "../components/OrderSummaryCard";
import PaymentModal from "@/modules/payment/components/PaymentModal";
import Spinner from "@/components/feedback/Spinner";

const ManagerPosPage = () => {
  const navigate = useNavigate();
  const staffPos = useStaffPos();
  const paymentHook = usePaymentModal();

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
    handleCheckout,
    submitStatus,
    refetchMenu,
  } = staffPos;

  // Handle successful payment checkout
  const handlePaymentSuccess = (confirmedPayment) => {
    const invoiceId = confirmedPayment?.invoiceId?._id || confirmedPayment?.invoiceId;

    // Clear cart in Redux so the next order starts fresh
    void handleClearCart({ skipCancel: true });

    // Navigate to Manager Receipt page
    navigate(`/manager/receipts/${invoiceId}`);
  };

  const handleCheckoutClick = (method) => {
    void handleCheckout(method, paymentHook.openModal);
  };

  const handlePaymentConfirm = () => {
    void paymentHook.submitCheckout(handlePaymentSuccess);
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
      <div className="flex flex-col items-center justify-center h-[70vh] select-none text-center px-4">
        <span className="material-symbols-outlined text-[64px] text-error mb-4">
          error
        </span>
        <h2 className="text-headline-sm font-bold text-on-surface mb-2">
          Không thể tải thực đơn
        </h2>
        <p className="text-body-sm text-on-surface-variant max-w-sm">
          {menuError} Vui lòng nhấn nút thử lại bên dưới.
        </p>
        <button
          type="button"
          onClick={() => void refetchMenu()}
          className="mt-6 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-xl shadow hover:opacity-90 transition-opacity"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  // Handle case where today's menu has not been generated/published yet
  if (!todayMenu) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] select-none text-center px-4">
        <span className="material-symbols-outlined text-[64px] text-outline/50 mb-4">
          restaurant
        </span>
        <h2 className="text-headline-sm font-bold text-on-surface mb-2">
          Chưa có thực đơn hôm nay
        </h2>
        <p className="text-body-sm text-on-surface-variant max-w-sm">
          Thực đơn ngày hôm nay chưa được thiết lập hoặc công bố. 
          Vui lòng nhấn tạo thực đơn trong trang quản lý thực đơn ngày.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col overflow-hidden select-none -m-8 p-8 bg-background">
      <div className="grid grid-cols-12 gap-6 h-full min-h-0">
        
        {/* LEFT COLUMN: Search, Categories & Menu Grid (8 cols) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col h-full min-h-0">
          
          {/* Search bar & title bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shrink-0">
            <div>
              <h1 className="text-headline-sm font-bold text-on-surface">
                Tạo Đơn Hàng (Manager POS)
              </h1>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                Chọn món ăn và thực hiện bán hàng với quyền quản lý
              </p>
            </div>

            {/* Content Search Input */}
            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm món ăn nhanh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Horizontal Category Filtering */}
          <CategoryFilterBar
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />

          {/* Menu Grid */}
          <PosMenuGrid
            items={filteredMenuItems}
            onAddItem={handleAddItem}
          />
        </div>

        {/* RIGHT COLUMN: Order Summary (4 cols) */}
        <div className="col-span-12 lg:col-span-4 h-full min-h-0">
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

      {/* Payment Modal Dialog */}
      <PaymentModal
        open={paymentHook.isOpen}
        order={paymentHook.order}
        onClose={paymentHook.closeModal}
        onConfirm={handlePaymentConfirm}
        selectedMethod={paymentHook.selectedMethod}
        setSelectedMethod={paymentHook.setSelectedMethod}
        cashReceived={paymentHook.cashReceived}
        transactionCode={paymentHook.transactionCode}
        setTransactionCode={paymentHook.setTransactionCode}
        providerName={paymentHook.providerName}
        setProviderName={paymentHook.setProviderName}
        isSubmitting={paymentHook.isSubmitting}
        appendDigit={paymentHook.appendDigit}
        clearCash={paymentHook.clearCash}
        setCashReceivedAmount={paymentHook.setCashReceivedAmount}
        changeReturned={paymentHook.changeReturned}
        isCashValid={paymentHook.isCashValid}
      />
    </div>
  );
};

export default ManagerPosPage;
