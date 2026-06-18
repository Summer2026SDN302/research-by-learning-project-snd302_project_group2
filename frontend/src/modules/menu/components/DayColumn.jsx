import EmptyState from "../../../components/data-display/EmptyState";
import Spinner from "../../../components/feedback/Spinner";
import { DAY_LABEL } from "../constants/scheduledMenuConstants";

const FoodItemCard = ({ item, onRemove }) => {
  const food = item.foodItemId;
  const name = food?.name ?? "—";
  const category = food?.categoryId?.name ?? "";

  return (
    <div className="group flex items-center justify-between rounded-lg border border-outline-variant bg-surface p-3">
      <div className="min-w-0">
        <p className="truncate text-body-sm font-semibold text-on-surface">{name}</p>
        {category && (
          <p className="text-label-md text-on-surface-variant mt-0.5">{category}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(item.foodItemId?._id || item.foodItemId)}
        className="ml-2 shrink-0 rounded-full p-1 text-on-surface-variant opacity-0 transition-opacity hover:bg-error-container hover:text-error group-hover:opacity-100"
        aria-label="Xóa món"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
};

const DayColumn = ({
  day,
  isDirty = false,
  isSaving = false,
  onAddItem,
  onRemoveItem,
  onSaveDay,
}) => {
  const label = DAY_LABEL[day.dayOfWeek] ?? day.dayOfWeek;
  const isWeekend = day.dayOfWeek === "Saturday" || day.dayOfWeek === "Sunday";
  const isEmpty = day.menuItems.length === 0;

  return (
    <div
      className={`flex h-[400px] flex-col rounded-xl border p-4 shadow-sm ${
        isDirty
          ? "border-primary bg-primary-container/10"
          : "border-outline-variant bg-surface-container-lowest"
      } ${isWeekend ? "opacity-60" : ""}`}
    >
      <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-2">
        <span className="text-label-md font-bold text-on-surface">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-label-md text-on-surface-variant">
            {day.menuItems.length} món
          </span>
          {isDirty && (
            <button
              type="button"
              onClick={() => onSaveDay?.(day.dayOfWeek)}
              disabled={isSaving}
              className="rounded-full p-1 text-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Lưu ${label}`}
              title={`Lưu ${label}`}
            >
              {isSaving ? (
                <Spinner size="sm" />
              ) : (
                <span className="material-symbols-outlined text-[18px]">save</span>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center">
            {isWeekend ? (
              <p className="text-center text-label-md text-on-surface-variant">
                Nghỉ cuối tuần
              </p>
            ) : (
              <EmptyState
                compact
                icon="lunch_dining"
                title="Chưa có món"
                message="Nhấn Thêm món bên dưới."
              />
            )}
          </div>
        ) : (
          day.menuItems.map((item, idx) => (
            <FoodItemCard
              key={item.foodItemId?._id || idx}
              item={item}
              onRemove={(foodItemId) => onRemoveItem(day.dayOfWeek, foodItemId)}
            />
          ))
        )}
      </div>

      <button
        type="button"
        onClick={() => onAddItem(day.dayOfWeek)}
        className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-outline-variant py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        Thêm món
      </button>
    </div>
  );
};

export default DayColumn;
