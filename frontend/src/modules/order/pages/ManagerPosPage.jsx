// [CHƯA CÓ BE] import useNavigate — sẽ dùng khi BE có module Invoice để navigate đến receipt
// import { useNavigate } from "react-router-dom";
import { useStaffPos } from "../hooks/useStaffPos";
// [CHƯA CÓ BE] PaymentModal — module Payment chưa có ở BE
// import { usePaymentModal } from "@/modules/payment/hooks/usePaymentModal";
// import PaymentModal from "@/modules/payment/components/PaymentModal";
import CategoryFilterBar from "../components/CategoryFilterBar";
import PosMenuGrid from "../components/PosMenuGrid";
import OrderSummaryCard from "../components/OrderSummaryCard";
import Spinner from "@/components/feedback/Spinner";

const ManagerPosPage = () => {
  // [CHƯA CÓ BE] useNavigate — sẽ cần khi có Invoice page
  // const navigate = useNavigate();
  const staffPos = useStaffPos();
  // [CHƯA CÓ BE] usePaymentModal — module Payment chưa có ở BE
  // const paymentHook = usePaymentModal();

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
    // [CHƯA CÓ BE] orderNotes,
    // [CHƯA CÓ BE] handleOrderNotesChange,
    handleAddItem,
    handleRemoveItem,
    handleUpdateQuantity,
    // [CHƯA CÓ BE] handleUpdateNote,
    handleClearCart,
    handleSubmitOrder,
    // [CHƯA CÓ BE] handleCheckout,
    submitStatus,
    refetchMenu,
  } = staffPos;

  // [CHƯA CÓ BE] handlePaymentSuccess — module Payment/Invoice chưa có ở BE
  // const handlePaymentSuccess = (confirmedPayment) => {
  //   const invoiceId = confirmedPayment?.invoiceId?._id || confirmedPayment?.invoiceId;
  //   void handleClearCart({ skipCancel: true });
  //   navigate(`/manager/receipts/${invoiceId}`);
  // };

  // Bấm "Thanh toán" → tạo đơn trực tiếp (không mở PaymentModal vì BE chưa có)
  const handleCheckoutClick = () => {
    void handleSubmitOrder();
  };

  // [CHƯA CÓ BE] handlePaymentConfirm — module Payment chưa có ở BE
  // const handlePaymentConfirm = () => {
  //   void paymentHook.submitCheckout(handlePaymentSuccess);
  // };

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
            <div className="relative w-full shrink-0 md:w-[18rem] md:min-w-[18rem] md:max-w-[18rem] md:flex-none">
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
            // [CHƯA CÓ BE] orderNotes={orderNotes}
            // [CHƯA CÓ BE] onOrderNotesChange={handleOrderNotesChange}
            onUpdateQuantity={handleUpdateQuantity}
            // [CHƯA CÓ BE] onUpdateNote={handleUpdateNote}
            onRemove={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckout={handleCheckoutClick}
            isSubmitting={submitStatus === "loading"}
          />
        </div>
      </div>

      {/* [CHƯA CÓ BE] PaymentModal — module Payment chưa có ở BE */}
      {/* <PaymentModal
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
        quickCashOptions={paymentHook.quickCashOptions}
      /> */}
    </div>
  );
};

export default ManagerPosPage;
