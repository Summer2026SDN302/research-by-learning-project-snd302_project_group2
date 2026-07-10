import { useCallback } from "react";
import { useStaffPos } from "../hooks/useStaffPos";
import CategoryFilterBar from "../components/CategoryFilterBar";
import PosMenuGrid from "../components/PosMenuGrid";
import OrderSummaryCard from "../components/OrderSummaryCard";
import Spinner from "@/components/feedback/Spinner";
import EmptyState from "@/components/data-display/EmptyState";
import SearchBar from "@/components/search/SearchBar";
import useAppToast from "@/hooks/useAppToast";
import PaymentModal from "@/modules/payment/components/PaymentModal";
import { DEFAULT_PAYMENT_METHOD } from "@/modules/payment/constants/paymentConstants";
import { usePaymentModal } from "@/modules/payment/hooks/usePaymentModal";

const PosPage = ({ role = "staff" }) => {
  const { toast } = useAppToast();
  const staffPos = useStaffPos();
  const paymentModal = usePaymentModal();

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

  const {
    isOpen,
    order,
    selectedMethod,
    setSelectedMethod,
    cashReceived,
    transactionCode,
    setTransactionCode,
    providerName,
    setProviderName,
    isSubmitting: isPaymentSubmitting,
    openModal,
    closeModal,
    appendDigit,
    clearCash,
    setCashReceivedAmount,
    changeReturned,
    isCashValid,
    quickCashOptions,
    submitCheckout,
    confirmPaymentOffline,
    checkoutUrl,
    confirmedPaymentData,
  } = paymentModal;

  const handlePaymentSuccess = useCallback(
    async (payment) => {
      await handleClearCart();

      try {
        await refetchMenu();
      } catch {
        // Receipt navigation should not be blocked by a temporary menu refresh issue.
      }

      toast.success(
        "Thanh toán thành công",
        payment?.paymentMethod === "QR"
          ? "Giao dịch đã được xác nhận thành công qua PayOS."
          : "Giao dịch đã thanh toán xong và được ghi nhận.",
      );
    },
    [handleClearCart, refetchMenu, toast],
  );

  const handleCheckoutClick = useCallback(async () => {
    if (cart.items.length === 0) {
      return;
    }

    // 1. Submit the order to backend first to get the created order with _id
    const createdOrder = await handleSubmitOrder({ showSuccessToast: false });
    if (!createdOrder) {
      return; // Order creation failed (e.g. out of stock)
    }

    // 2. Open payment modal with the created order
    openModal(createdOrder, DEFAULT_PAYMENT_METHOD);
  }, [cart.items, handleSubmitOrder, openModal]);

  const handlePaymentConfirm = useCallback(async () => {
    if (checkoutUrl) {
      const confirmed = await confirmPaymentOffline(
        confirmedPaymentData._id,
        transactionCode,
      );
      if (confirmed) {
        await handlePaymentSuccess(confirmed);
      }
      return;
    }
    void submitCheckout(handlePaymentSuccess);
  }, [
    handlePaymentSuccess,
    submitCheckout,
    confirmPaymentOffline,
    checkoutUrl,
    confirmedPaymentData,
    transactionCode,
  ]);

  const handlePaymentClose = useCallback(() => {
    closeModal();
  }, [closeModal]);

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
    <>
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

      <PaymentModal
        open={isOpen}
        order={order}
        onClose={handlePaymentClose}
        onConfirm={handlePaymentConfirm}
        selectedMethod={selectedMethod}
        setSelectedMethod={setSelectedMethod}
        cashReceived={cashReceived}
        transactionCode={transactionCode}
        setTransactionCode={setTransactionCode}
        providerName={providerName}
        setProviderName={setProviderName}
        isSubmitting={isPaymentSubmitting}
        appendDigit={appendDigit}
        clearCash={clearCash}
        setCashReceivedAmount={setCashReceivedAmount}
        changeReturned={changeReturned}
        isCashValid={isCashValid}
        quickCashOptions={quickCashOptions}
        checkoutUrl={checkoutUrl}
      />
    </>
  );
};

export default PosPage;
