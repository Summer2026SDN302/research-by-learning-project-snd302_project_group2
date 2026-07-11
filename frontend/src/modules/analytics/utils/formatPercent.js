export const formatPercent = (value, { showSign = true } = {}) => {
  if (value == null || Number.isNaN(Number(value))) {
    return "—";
  }

  const rounded = Math.round(Number(value) * 10) / 10;

  if (rounded === 0) {
    return "0%";
  }

  if (!showSign) {
    return `${Math.abs(rounded)}%`;
  }

  return rounded > 0 ? `+${rounded}%` : `${rounded}%`;
};

export const formatOrderDelta = (delta) => {
  if (delta == null || Number.isNaN(Number(delta))) {
    return "";
  }

  const value = Number(delta);
  if (value === 0) {
    return "0 đơn";
  }

  return value > 0 ? `+${value} đơn` : `${value} đơn`;
};
