import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
const TopItemsChart = ({ forecasts }) => {
  const data = useMemo(() => {
    if (!forecasts || forecasts.length === 0) return [];

    // Sort descending by predictedDemand and take top 5
    return [...forecasts]
      .sort((a, b) => b.predictedDemand - a.predictedDemand)
      .slice(0, 5)
      .map((item) => ({
        name: item.name || "Món ẩn",
        demand: item.predictedDemand,
      }));
  }, [forecasts]);

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-surface-container rounded-xl">
        <p className="text-on-surface-variant font-body-sm">Chưa có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm h-full">
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary">
          bar_chart
        </span>
        Top 5 Món Ăn Bán Chạy Nhất
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              className="stroke-surface-variant"
            />
            <XAxis
              type="number"
              className="stroke-outline"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              className="stroke-outline"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip
              cursor={{ className: "fill-surface-container-low" }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #bcc9c6",
              }}
              labelStyle={{ fontWeight: "bold", color: "#00201d" }}
            />
            <Bar dataKey="demand" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  className={index === 0 ? "fill-secondary" : "fill-primary-fixed-dim"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TopItemsChart;
