/**
 * EmptyState
 *
 * Props:
 *   icon      {string}   – Material Symbol name
 *   title     {string}
 *   message   {string}
 *   action    {ReactNode} – optional CTA button
 *   compact   {boolean}  – smaller layout for nested panels
 */
const EmptyState = ({
  icon = 'inbox',
  title = 'Chưa có dữ liệu',
  message = 'Hiện tại chưa có mục nào. Hãy thêm mới để bắt đầu.',
  action = null,
  compact = false,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'py-4 px-3' : 'py-20 px-6'
      }`}
    >
      <div
        className={`bg-surface-container rounded-full flex items-center justify-center ${
          compact ? 'w-12 h-12 mb-2' : 'w-20 h-20 mb-5'
        }`}
      >
        <span
          className={`material-symbols-outlined text-outline ${
            compact ? 'text-[28px]' : 'text-[44px]'
          }`}
          style={{
            fontVariationSettings: compact
              ? "'FILL' 0, 'wght' 300, 'opsz' 28"
              : "'FILL' 0, 'wght' 300, 'opsz' 48",
          }}
        >
          {icon}
        </span>
      </div>

      <h3
        className={`font-bold text-on-surface mb-2 ${
          compact ? 'text-body-sm' : 'text-headline-sm'
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-on-surface-variant max-w-xs ${
          compact ? 'text-label-md' : 'text-body-sm'
        }`}
      >
        {message}
      </p>

      {action && <div className={compact ? 'mt-3' : 'mt-6'}>{action}</div>}
    </div>
  );
};

export default EmptyState;
