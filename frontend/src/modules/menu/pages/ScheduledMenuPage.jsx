import { useState } from "react";
import { useSelector } from "react-redux";

import ConfirmDialog from "../../../components/feedback/ConfirmDialog";
import LoadingOverlay from "../../../components/feedback/LoadingOverlay";
import Spinner from "../../../components/feedback/Spinner";
import PageHeader from "../../../components/layout/PageHeader";
import DayColumn from "../components/scheduled-menu/DayColumn";
import FoodItemPickerModal from "../components/scheduled-menu/FoodItemPickerModal";
import { DAY_LABEL } from "../constants/scheduledMenuConstants";
import useScheduledMenu from "../hooks/scheduled-menu/useScheduledMenu";

const ScheduledMenuPage = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saveDayTarget, setSaveDayTarget] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const isAdmin = String(user?.role ?? "").toLowerCase() === "admin";

  const {
    schedule,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    dirtyDays,
    pickerOpen,
    pickerDay,
    pickerSearch,
    pickerCategory,
    filteredPickerItems,
    categories,
    openPicker,
    closePicker,
    addItemsToDay,
    removeItemFromDay,
    saveDaySchedule,
    saveAllSchedule,
    cancelDayEdits,
    cancelAllEdits,
    updatePickerFilters,
  } = useScheduledMenu();

  const currentDaySchedule = schedule.find((entry) => entry.dayOfWeek === pickerDay);
  const initialSelectedIds = currentDaySchedule
    ? currentDaySchedule.menuItems.map((item) => item.foodItemId?._id || item.foodItemId)
    : [];

  const handlePickerAdd = (selectedItems) => {
    if (pickerDay) {
      addItemsToDay(pickerDay, selectedItems);
      closePicker();
    }
  };

  const handleConfirmSave = async () => {
    const success = await saveAllSchedule();
    if (success) {
      setConfirmOpen(false);
    }
  };

  const handleConfirmSaveDay = async () => {
    if (saveDayTarget) {
      const success = await saveDaySchedule(saveDayTarget);
      if (success) {
        setSaveDayTarget(null);
      }
    }
  };

  const dirtyDayLabel =
    dirtyDays.length === 1
      ? "1 ngày"
      : `${dirtyDays.length} ngày`;

  return (
    <div className="relative">
      <LoadingOverlay show={isLoading} fullPage message="Đang tải lịch thực đơn..." />

      <PageHeader
        breadcrumbs={[{ label: isAdmin ? "Admin" : "Manager" }, { label: "Thực đơn theo lịch" }]}
        title="Thực đơn theo lịch"
        subtitle="Cấu hình thực đơn cho từng ngày trong tuần"
        action={
          isAdmin && (
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <button
                  type="button"
                  onClick={cancelAllEdits}
                  disabled={isSaving || isLoading}
                  className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-5 py-2.5 text-label-md font-bold text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Hủy thay đổi
                </button>
              )}
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={isSaving || isLoading || !hasUnsavedChanges}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-label-md font-bold text-on-primary shadow-sm transition-colors hover:bg-surface-tint disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving && <Spinner size="sm" />}
                Lưu thay đổi
              </button>
            </div>
          )
        }
      />

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-outline-variant scrollbar-track-transparent">
        {schedule.map((day) => (
          <DayColumn
            key={day.dayOfWeek}
            day={day}
            isDirty={dirtyDays.includes(day.dayOfWeek)}
            isSaving={isSaving}
            isAdmin={isAdmin}
            onAddItem={openPicker}
            onRemoveItem={removeItemFromDay}
            onSaveDay={setSaveDayTarget}
            onCancelDay={cancelDayEdits}
          />
        ))}
      </div>

      <FoodItemPickerModal
        open={pickerOpen}
        day={pickerDay}
        search={pickerSearch}
        category={pickerCategory}
        categories={categories}
        items={filteredPickerItems}
        initialSelectedIds={initialSelectedIds}
        onSearch={(search) => updatePickerFilters({ search })}
        onCategory={(category) => updatePickerFilters({ category })}
        onAdd={handlePickerAdd}
        onClose={closePicker}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Lưu thay đổi lịch tuần?"
        description={`Bạn đã chỉnh sửa ${dirtyDayLabel}. Các thay đổi sẽ được lưu lên hệ thống.`}
        confirmLabel="Lưu thay đổi"
        cancelLabel="Hủy"
        variant="info"
        isLoading={isSaving}
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(saveDayTarget)}
        title={`Lưu thay đổi lịch ${DAY_LABEL[saveDayTarget] || saveDayTarget}?`}
        description={`Các thay đổi đối với lịch ${DAY_LABEL[saveDayTarget] || saveDayTarget} sẽ được lưu lên hệ thống.`}
        confirmLabel="Lưu thay đổi"
        cancelLabel="Hủy"
        variant="info"
        isLoading={isSaving}
        onConfirm={handleConfirmSaveDay}
        onCancel={() => setSaveDayTarget(null)}
      />
    </div>
  );
};

export default ScheduledMenuPage;
