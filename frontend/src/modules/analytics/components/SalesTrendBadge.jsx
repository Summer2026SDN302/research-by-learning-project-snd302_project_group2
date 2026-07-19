const SalesTrendBadge = ({ value }) => {
  if (value == null) {
    return (
      <span className="text-body-sm text-on-surface-variant flex items-center gap-1">
        <span className="material-symbols-outlined text-[14px]">horizontal_rule</span>
        0%
      </span>
    );
  }

  const isPositive = value > 0;
  const isNegative = value < 0;

  return (
    <span
      className={`text-body-sm flex items-center gap-1 ${
        isPositive
          ? "text-secondary"
          : isNegative
            ? "text-error"
            : "text-on-surface-variant"
      }`}
    >
      <span className="material-symbols-outlined text-[14px]">
        {isPositive ? "arrow_upward" : isNegative ? "arrow_downward" : "horizontal_rule"}
      </span>
      {isPositive ? `+${value}%` : isNegative ? `${value}%` : "0%"}
    </span>
  );
};

export default SalesTrendBadge;
