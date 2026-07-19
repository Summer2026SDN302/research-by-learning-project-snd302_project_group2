/**
 * StatisticCard
 *
 * Props:
 *   icon       {string}   – Material Symbol name
 *   label      {string}
 *   value      {string | number}
 *   change     {string}   – e.g. '+12%' or '-3%' (optional)
 *   variant    {string}   – 'primary' | 'secondary' | 'tertiary' | 'error'
 */
const VARIANT_MAP = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  secondary: { bg: "bg-secondary-container/20", text: "text-secondary" },
  tertiary: { bg: "bg-tertiary-container/20", text: "text-tertiary" },
  error: { bg: "bg-error-container/20", text: "text-error" },
};

const StatisticCard = ({
  icon = "bar_chart",
  label = "Metric",
  value = "—",
  change = "",
  changeSuffix = "so với hôm qua",
  variant = "primary",
}) => {
  const { bg, text } = VARIANT_MAP[variant] ?? VARIANT_MAP.primary;
  const isPositive = change.startsWith("+");
  const isNegative = change.startsWith("-");

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6 flex items-center gap-4 hover:shadow-elevated transition-shadow duration-200">
      {/* Icon */}
      <div
        className={`${bg} ${text} p-4 rounded-xl shrink-0 flex items-center justify-center`}
      >
        <span
          className="material-symbols-outlined text-[28px]"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'opsz' 32" }}
        >
          {icon}
        </span>
      </div>

      {/* Content */}
      <div className="min-w-0">
        <p
          className="text-label-md text-on-surface-variant uppercase tracking-wider line-clamp-2"
          title={typeof label === "string" ? label : undefined}
        >
          {" "}
          {label}
        </p>
        <p className="text-headline-md font-bold text-on-surface mt-0.5">
          {value}
        </p>
        {change && (
          <p
            className={`text-[11px] font-semibold mt-1 ${
              isPositive
                ? "text-secondary"
                : isNegative
                  ? "text-error"
                  : "text-on-surface-variant"
            }`}
          >
            {isPositive && "▲ "}
            {isNegative && "▼ "}
            {change}
            {changeSuffix ? ` ${changeSuffix}` : ""}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatisticCard;
