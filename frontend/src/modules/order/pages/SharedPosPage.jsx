import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "@/components/feedback/Spinner";
import useAppToast from "@/hooks/useAppToast";
import PaymentModal from "@/modules/payment/components/PaymentModal";
import { DEFAULT_PAYMENT_METHOD } from "@/modules/payment/constants/paymentConstants";
import { usePaymentModal } from "@/modules/payment/hooks/usePaymentModal";
import CategoryFilterBar from "../components/CategoryFilterBar";
import OrderSummaryCard from "../components/OrderSummaryCard";
import PosMenuGrid from "../components/PosMenuGrid";
import { useStaffPos } from "../hooks/useStaffPos";

const getPaymentReceiptId = (payment) => payment?._id || null;

const SharedPosPage = ({
  title,
  subtitle,
  receiptBasePath,
  emptyMenuDescription,
}) => {
  const navigate = useNavigate();
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
    cartItemsWithMeta,
    cartTotals,
    menuItemSelectionMap,
    orderNotes,
    handleOrderNotesChange,
    handleUpdateItemNote,
    handleAddItem,
    handleRemoveItem,
    handleUpdateQuantity,
    handleClearCart,
    handleSubmitOrder,
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
    isSubmitting,
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

      const paymentId = getPaymentReceiptId(payment);

      if (paymentId) {
        navigate(`${receiptBasePath}/${paymentId}`);
        return;
      }

      toast.success(
        "Thanh toan thanh cong",
        "Giao dich da duoc xac nhan, nhung chua tim thay ma thanh toan de mo bien lai.",
      );
    },
    [handleClearCart, navigate, receiptBasePath, refetchMenu, toast],
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
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3 select-none">
        <Spinner size="lg" />
        <p className="text-body-sm font-medium text-on-surface-variant">
          Dang tai thong tin thuc don hom nay...
        </p>
      </div>
    );
  }

  if (menuError) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center px-4 text-center select-none">
        <span className="material-symbols-outlined mb-4 text-[64px] text-error">
          error
        </span>
        <h2 className="mb-2 text-headline-sm font-bold text-on-surface">
          Khong the tai thuc don
        </h2>
        <p className="max-w-sm text-body-sm text-on-surface-variant">
          {menuError} Vui long nhan nut thu lai ben duoi.
        </p>
        <button
          type="button"
          onClick={() => void refetchMenu()}
          className="mt-6 rounded-xl bg-primary px-5 py-2.5 font-bold text-on-primary shadow transition-opacity hover:opacity-90"
        >
          Tai lai trang
        </button>
      </div>
    );
  }

  if (!todayMenu) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center px-4 text-center select-none">
        <span className="material-symbols-outlined mb-4 text-[64px] text-outline/50">
          restaurant
        </span>
        <h2 className="mb-2 text-headline-sm font-bold text-on-surface">
          Chua co thuc don hom nay
        </h2>
        <p className="max-w-sm text-body-sm text-on-surface-variant">
          {emptyMenuDescription}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="-m-8 flex h-[calc(100vh-140px)] flex-col overflow-hidden bg-background p-8 select-none">
        <div className="grid h-full min-h-0 grid-cols-12 gap-6">
          <div className="col-span-12 flex h-full min-h-0 flex-col lg:col-span-8">
            <div className="mb-4 flex shrink-0 flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="text-headline-sm font-bold text-on-surface">
                  {title}
                </h1>
                <p className="mt-0.5 text-xs font-medium text-on-surface-variant">
                  {subtitle}
                </p>
              </div>

              <div className="relative w-full shrink-0 md:w-[18rem] md:min-w-[18rem] md:max-w-[18rem] md:flex-none">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Tim mon an nhanh..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-low py-2.5 pl-9 pr-4 text-body-sm text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      close
                    </span>
                  </button>
                )}
              </div>
            </div>

            <CategoryFilterBar
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />

            <PosMenuGrid
              items={filteredMenuItems}
              onAddItem={handleAddItem}
              selectionMetaMap={menuItemSelectionMap}
            />
          </div>

          <div className="col-span-12 h-full min-h-0 lg:col-span-4">
            <OrderSummaryCard
              cart={{ ...cart, items: cartItemsWithMeta }}
              totals={cartTotals}
              orderNotes={orderNotes}
              onOrderNotesChange={handleOrderNotesChange}
              onUpdateNote={handleUpdateItemNote}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
              onClearCart={handleClearCart}
              onCheckout={handleCheckoutClick}
            />
          </div>
        </div>
      </div>

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
        isSubmitting={isSubmitting}
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

export default SharedPosPage;
