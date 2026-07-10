import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "fill-secondary",
  "fill-primary-fixed-dim",
  "fill-on-primary-fixed-variant",
  "fill-secondary-container",
  "fill-tertiary",
  "fill-tertiary-fixed-dim",
];

const CategoryPieChart = ({ forecasts }) => {
  const data = useMemo(() => {
    if (!forecasts || forecasts.length === 0) return [];

    // Group by category name
    const categoryMap = {};
    forecasts.forEach((f) => {
      const catName = f.foodItemId?.categoryId?.name || "Khác";
      if (!categoryMap[catName]) {
        categoryMap[catName] = 0;
      }
      categoryMap[catName] += f.predictedDemand;
    });

    return Object.keys(categoryMap)
      .map((cat) => ({ name: cat, value: categoryMap[cat] }))
      .sort((a, b) => b.value - a.value);
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
        <span className="material-symbols-outlined text-tertiary">
          pie_chart
        </span>
        Tỉ Lệ Nhu Cầu Theo Danh Mục
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  className={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} phần`, "Nhu cầu"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #bcc9c6",
              }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryPieChart;
