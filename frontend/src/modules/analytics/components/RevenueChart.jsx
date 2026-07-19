import dayjs from "dayjs";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import EmptyState from "../../../components/data-display/EmptyState";
import { CHART_COLORS, chartTooltipFormatter, formatYAxisTick } from "../utils/chartConfig";
import DashboardSkeleton from "./DashboardSkeleton";

const formatXAxisTick = (tickVal) => {
  if (typeof tickVal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(tickVal)) {
    const d = dayjs(tickVal);
    return d.isValid() ? d.format("DD/MM") : tickVal;
  }
  return tickVal;
};

const RevenueChart = ({
  labels = [],
  values = [],
  loading = false,
}) => {
  const chartData = labels.map((label, index) => ({
    label,
    revenue: values[index] ?? 0,
  }));

  const hasData = chartData.length > 0;

  return (
    <div className="bg-surface rounded-xl border border-outline-variant shadow-soft p-6">
      <div className="flex justify-between items-center mb-6 gap-4">
        <h3 className="text-headline-sm font-bold text-on-surface">
          Biểu Đồ Doanh Thu
        </h3>
      </div>

      {loading ? (
        <DashboardSkeleton variant="chart" />
      ) : !hasData ? (
        <EmptyState
          compact
          icon="analytics"
          title="Chưa có dữ liệu"
          message="Chưa có dữ liệu doanh thu trong khoảng thời gian này."
        />
      ) : (
        <div className="h-72" aria-label="Biểu đồ doanh thu theo ngày">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={CHART_COLORS.primary}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="100%"
                    stopColor={CHART_COLORS.primary}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="5 5"
                stroke={CHART_COLORS.grid}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
                tickFormatter={formatXAxisTick}
                minTickGap={45}
              />
              <YAxis
                tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
                tickFormatter={formatYAxisTick}
              />
              <Tooltip
                formatter={(value) => chartTooltipFormatter(value)}
                contentStyle={{
                  backgroundColor: CHART_COLORS.tooltipBg,
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 13,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={CHART_COLORS.primary}
                fill="url(#revenueGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
