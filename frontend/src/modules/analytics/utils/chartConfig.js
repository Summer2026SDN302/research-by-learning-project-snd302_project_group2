import { formatCurrency } from "@/utils/formatters";

export const CHART_COLORS = {
  primary: "#00685f",
  grid: "#dee4e1",
  axis: "#3d4947",
  tooltipBg: "#2c3130",
};

export const chartTooltipFormatter = (value) => formatCurrency(value);

export const formatYAxisTick = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return value;

  if (num >= 1000000) {
    const divided = num / 1000000;
    return `${Number.isInteger(divided) ? divided : divided.toFixed(1)} Tr`;
  }
  if (num >= 1000) {
    const divided = num / 1000;
    return `${Number.isInteger(divided) ? divided : divided.toFixed(1)}k`;
  }
  return num.toString();
};
