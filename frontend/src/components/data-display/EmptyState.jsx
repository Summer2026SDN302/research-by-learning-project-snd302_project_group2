/**
 * EmptyState
 *
 * Props:
 *   icon      {string}   – Material Symbol name
 *   title     {string}
 *   message   {string}
 *   action    {ReactNode} – optional CTA button
 */
const EmptyState = ({
  icon = 'inbox',
  title = 'Chưa có dữ liệu',
  message = 'Hiện tại chưa có mục nào. Hãy thêm mới để bắt đầu.',
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Icon circle */}
      <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-5">
        <span
          className="material-symbols-outlined text-[44px] text-outline"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'opsz' 48" }}
        >
          {icon}
        </span>
      </div>

      <h3 className="text-headline-sm font-bold text-on-surface mb-2">{title}</h3>
      <p className="text-body-sm text-on-surface-variant max-w-xs">{message}</p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
