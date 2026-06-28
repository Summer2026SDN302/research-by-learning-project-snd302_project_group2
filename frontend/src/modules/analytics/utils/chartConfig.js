import { formatCurrency } from "@/utils/formatters";

export const CHART_COLORS = {
  primary: "#00685f",
  grid: "#dee4e1",
  axis: "#3d4947",
  tooltipBg: "#2c3130",
};

export const chartTooltipFormatter = (value) => formatCurrency(value);
