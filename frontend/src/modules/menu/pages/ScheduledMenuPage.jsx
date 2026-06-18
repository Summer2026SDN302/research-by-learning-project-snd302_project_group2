import { useState } from "react";

import ConfirmDialog from "../../../components/feedback/ConfirmDialog";
import LoadingOverlay from "../../../components/feedback/LoadingOverlay";
import Spinner from "../../../components/feedback/Spinner";
import PageHeader from "../../../components/layout/PageHeader";
import DayColumn from "../components/DayColumn";
import FoodItemPickerModal from "../components/FoodItemPickerModal";
import useScheduledMenu from "../hooks/useScheduledMenu";

const ScheduledMenuPage = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);

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
    addItemToDay,
    removeItemFromDay,
    saveDaySchedule,
    saveAllSchedule,
    setPickerSearch,
    setPickerCategory,
  } = useScheduledMenu();

  const handlePickerSelect = (item) => {
    if (pickerDay) addItemToDay(pickerDay, item);
  };

  const handleConfirmSave = async () => {
    const success = await saveAllSchedule();
    if (success) {
      setConfirmOpen(false);
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
        breadcrumbs={[{ label: "Admin" }, { label: "Thực đơn theo lịch" }]}
        title="Thực đơn theo lịch"
        subtitle="Cấu hình thực đơn cho từng ngày trong tuần"
        action={
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={isSaving || isLoading || !hasUnsavedChanges}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-label-md font-bold text-on-primary shadow-sm transition-colors hover:bg-surface-tint disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving && <Spinner size="sm" />}
            Lưu thay đổi
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-7">
        {schedule.map((day) => (
          <DayColumn
            key={day.dayOfWeek}
            day={day}
            isDirty={dirtyDays.includes(day.dayOfWeek)}
            isSaving={isSaving}
            onAddItem={openPicker}
            onRemoveItem={removeItemFromDay}
            onSaveDay={saveDaySchedule}
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
        onSearch={setPickerSearch}
        onCategory={setPickerCategory}
        onSelect={handlePickerSelect}
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
    </div>
  );
};

export default ScheduledMenuPage;
