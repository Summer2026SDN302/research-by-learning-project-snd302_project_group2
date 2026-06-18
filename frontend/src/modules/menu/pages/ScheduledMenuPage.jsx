import LoadingOverlay from "../../../components/feedback/LoadingOverlay";
import Spinner from "../../../components/feedback/Spinner";
import PageHeader from "../../../components/layout/PageHeader";
import SearchBar from "../../../components/search/SearchBar";
import { DAY_LABEL } from "../constants/scheduledMenuConstants";
import useScheduledMenu from "../hooks/useScheduledMenu";

const formatPrice = (price) =>
  price != null
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
    : "";

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

const DayColumn = ({ day, onAddItem, onRemoveItem }) => {
  const label = DAY_LABEL[day.dayOfWeek] ?? day.dayOfWeek;
  const isWeekend = day.dayOfWeek === "Saturday" || day.dayOfWeek === "Sunday";

  return (
    <div
      className={`flex h-[400px] flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm ${
        isWeekend ? "opacity-60" : ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-2">
        <span className="text-label-md font-bold text-on-surface">{label}</span>
        <span className="text-label-md text-on-surface-variant">
          {day.menuItems.length} món
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {day.menuItems.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-label-md text-on-surface-variant">
              {isWeekend ? "Nghỉ cuối tuần" : "Chưa có món"}
            </p>
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
        onClick={() => onAddItem(day.dayOfWeek)}
        className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-outline-variant py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        Thêm món
      </button>
    </div>
  );
};

const FoodItemPickerModal = ({
  open,
  day,
  search,
  category,
  categories,
  items,
  onSearch,
  onCategory,
  onSelect,
  onClose,
}) => {
  if (!open) return null;

  const label = DAY_LABEL[day] ?? day;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex w-full max-w-lg flex-col rounded-2xl bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <h3 className="text-headline-sm font-bold text-on-surface">
            Thêm món — {label}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-3 px-6 py-4">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Tìm món ăn..."
            className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container"
          />

          {categories.length > 0 && (
            <select
              value={category}
              onChange={(e) => onCategory(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-2 text-body-sm text-on-surface focus:border-primary focus:outline-none"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto px-6 pb-2">
          {items.length === 0 ? (
            <p className="py-8 text-center text-body-sm text-on-surface-variant">
              Không tìm thấy món ăn nào.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <button
                  key={item._id}
                  onClick={() => onSelect(item)}
                  className="flex w-full items-center justify-between rounded-lg border border-outline-variant bg-surface px-4 py-3 text-left transition-colors hover:border-primary hover:bg-primary-container/10"
                >
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">
                      {item.name}
                    </p>
                    <p className="text-label-md text-on-surface-variant">
                      {item.categoryName || item.categoryId?.name || ""}
                    </p>
                  </div>
                  <span className="ml-4 shrink-0 text-body-sm text-primary">
                    {formatPrice(item.basePrice)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-outline-variant px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-outline-variant py-2 text-label-md text-on-surface-variant hover:bg-surface-container"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const ScheduledMenuPage = () => {
  const {
    schedule,
    isLoading,
    isSaving,
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
    saveAllSchedule,
    setPickerSearch,
    setPickerCategory,
  } = useScheduledMenu();

  const handlePickerSelect = (item) => {
    if (pickerDay) addItemToDay(pickerDay, item);
  };

  return (
    <div className="relative">
      <LoadingOverlay show={isLoading} fullPage message="Đang tải lịch thực đơn..." />

      <PageHeader
        breadcrumbs={[{ label: "Admin" }, { label: "Thực đơn theo lịch" }]}
        title="Thực đơn theo lịch"
        subtitle="Cấu hình thực đơn cho từng ngày trong tuần"
        action={
          <button
            onClick={saveAllSchedule}
            disabled={isSaving || isLoading}
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
            onAddItem={openPicker}
            onRemoveItem={removeItemFromDay}
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
    </div>
  );
};

export default ScheduledMenuPage;
