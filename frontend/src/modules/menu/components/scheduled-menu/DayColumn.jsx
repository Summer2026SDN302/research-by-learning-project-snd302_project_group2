import EmptyState from "../../../../components/data-display/EmptyState";
import Spinner from "../../../../components/feedback/Spinner";
import { DAY_LABEL } from "../../constants/scheduledMenuConstants";
import { formatCurrency } from "../../../../utils/formatters";

const FoodItemCard = ({ item, onRemove, isAdmin }) => {
  const food = item.foodItemId;
  const name = food?.name ?? "—";
  const category = food?.categoryId?.name ?? "";

  return (
    <div className="group flex items-center justify-between rounded-lg border border-outline-variant bg-surface p-3">
      <div className="min-w-0">
        <p className="truncate text-body-sm font-semibold text-on-surface">
          {name}
        </p>
        {category && (
          <p className="text-label-md text-on-surface-variant mt-0.5">
            {category}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {food?.basePrice != null && (
          <span className="text-body-sm text-primary font-medium">
            {formatCurrency(food.basePrice)}
          </span>
        )}
        {isAdmin && (
          <button
            onClick={() => onRemove(item.foodItemId?._id || item.foodItemId)}
            className="rounded-full p-1 text-on-surface-variant opacity-0 transition-opacity hover:bg-error-container hover:text-error group-hover:opacity-100 flex items-center justify-center"
            aria-label="Xóa món"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>
    </div>
  );
};

const DayColumn = ({
  day,
  isDirty = false,
  isSaving = false,
  isAdmin = false,
  onAddItem,
  onRemoveItem,
  onSaveDay,
  onCancelDay,
}) => {
  const label = DAY_LABEL[day.dayOfWeek] ?? day.dayOfWeek;
  const isEmpty = day.menuItems.length === 0;

  return (
    <div
      className={`flex h-[450px] w-[250px] shrink-0 flex-col rounded-xl border p-4 shadow-sm ${
        isDirty
          ? "border-primary bg-primary-container/10"
          : "border-outline-variant bg-surface-container-lowest"
      }`}
    >
      <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-2">
        <span className="text-label-md font-bold text-on-surface">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-label-md text-on-surface-variant">
            {day.menuItems.length} món
          </span>
          {isAdmin && isDirty && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSaveDay?.(day.dayOfWeek)}
                disabled={isSaving}
                className="rounded-full p-1 text-primary transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center"
                aria-label={`Lưu ${label}`}
                title={`Lưu ${label}`}
              >
                {isSaving ? (
                  <Spinner size="sm" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">
                    save
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => onCancelDay?.(day.dayOfWeek)}
                disabled={isSaving}
                className="rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center"
                aria-label={`Hủy ${label}`}
                title={`Hủy ${label}`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  undo
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              compact
              icon="lunch_dining"
              title="Chưa có món"
              message={isAdmin ? "Nhấn Thêm món bên dưới." : "Không có món ăn"}
            />
          </div>
        ) : (
          day.menuItems.map((item, idx) => (
            <FoodItemCard
              key={item.foodItemId?._id || idx}
              item={item}
              isAdmin={isAdmin}
              onRemove={(foodItemId) => onRemoveItem(day.dayOfWeek, foodItemId)}
            />
          ))
        )}
      </div>

      {isAdmin && (
        <button
          type="button"
          onClick={() => onAddItem(day.dayOfWeek)}
          className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-outline-variant py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Thêm món
        </button>
      )}
    </div>
  );
};

export default DayColumn;
